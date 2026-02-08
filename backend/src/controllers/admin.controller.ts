import { Response, NextFunction } from 'express';
import { and, eq, sql } from 'drizzle-orm';

import db from '../db/connection';
import { profiles, users } from '../db/schema';
import { AppError } from '../middlewares/errorHandler';
import { AuthRequest } from '../middlewares/auth';

const ROLE_VALUES = ['participant', 'organizer', 'admin'] as const;
export type RoleValue = (typeof ROLE_VALUES)[number];

function parseLimit(value: unknown, fallback = 50) {
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0) return fallback;
    return Math.min(Math.floor(n), 200);
}

function parseOffset(value: unknown, fallback = 0) {
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0) return fallback;
    return Math.floor(n);
}

async function countAdmins(): Promise<number> {
    const result = await db
        .select({ total: sql<number>`count(*)` })
        .from(profiles)
        .where(eq(profiles.role, 'admin'));

    const raw = (result[0] as any)?.total;
    return typeof raw === 'number' ? raw : Number(raw || 0);
}

export const listUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const search = String(req.query.search || '').trim();
        const role = String(req.query.role || '').trim();

        const limit = parseLimit(req.query.limit, 50);
        const offset = parseOffset(req.query.offset, 0);

        const conditions: any[] = [];

        if (role) {
            if (!ROLE_VALUES.includes(role as RoleValue)) {
                throw new AppError('Invalid role filter', 400);
            }
            conditions.push(eq(profiles.role, role as any));
        }

        if (search) {
            const q = `%${search}%`;
            conditions.push(
                sql`(${users.email} ILIKE ${q} OR ${profiles.fullName} ILIKE ${q})`
            );
        }

        const where = conditions.length > 0 ? and(...conditions) : undefined;

        const rows = await db
            .select({
                id: users.id,
                email: users.email,
                isVerified: users.isVerified,
                createdAt: users.createdAt,
                fullName: profiles.fullName,
                role: profiles.role,
                avatarUrl: profiles.avatarUrl,
            })
            .from(users)
            .leftJoin(profiles, eq(users.id, profiles.id))
            .where(where)
            .orderBy(sql`${users.createdAt} DESC`)
            .limit(limit)
            .offset(offset);

        const totalRows = await db
            .select({ total: sql<number>`count(*)` })
            .from(users)
            .leftJoin(profiles, eq(users.id, profiles.id))
            .where(where);

        const totalRaw = (totalRows[0] as any)?.total;
        const total = typeof totalRaw === 'number' ? totalRaw : Number(totalRaw || 0);

        res.json({
            users: rows.map((r) => ({
                id: r.id,
                email: r.email,
                isVerified: r.isVerified,
                createdAt: r.createdAt,
                profile: {
                    fullName: r.fullName,
                    role: r.role,
                    avatarUrl: r.avatarUrl,
                },
            })),
            total,
            limit,
            offset,
        });
    } catch (error) {
        next(error);
    }
};

export const getUserStats = async (_req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const [row] = await db
            .select({
                total: sql<number>`count(*)`,
                admins: sql<number>`count(*) filter (where ${profiles.role} = 'admin')`,
                organizers: sql<number>`count(*) filter (where ${profiles.role} = 'organizer')`,
                participants: sql<number>`count(*) filter (where ${profiles.role} = 'participant')`,
                verified: sql<number>`count(*) filter (where ${users.isVerified} = true)`,
                unverified: sql<number>`count(*) filter (where ${users.isVerified} = false)`,
            })
            .from(users)
            .leftJoin(profiles, eq(users.id, profiles.id));

        const asNumber = (v: unknown) => (typeof v === 'number' ? v : Number(v || 0));

        res.json({
            total: asNumber((row as any)?.total),
            admins: asNumber((row as any)?.admins),
            organizers: asNumber((row as any)?.organizers),
            participants: asNumber((row as any)?.participants),
            verified: asNumber((row as any)?.verified),
            unverified: asNumber((row as any)?.unverified),
        });
    } catch (error) {
        next(error);
    }
};

export const updateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!id) throw new AppError('User id is required', 400);

        if (req.user?.id && req.user.id === id && req.body?.role) {
            throw new AppError('You cannot change your own role', 400);
        }

        const role = req.body?.role as unknown;
        const fullName = req.body?.fullName as unknown;
        const avatarUrl = req.body?.avatarUrl as unknown;
        const isVerified = req.body?.isVerified as unknown;

        if (role !== undefined) {
            if (typeof role !== 'string' || !ROLE_VALUES.includes(role as RoleValue)) {
                throw new AppError('Invalid role', 400);
            }

            if (role !== 'admin') {
                const [current] = await db
                    .select({ role: profiles.role })
                    .from(profiles)
                    .where(eq(profiles.id, id))
                    .limit(1);

                if (current?.role === 'admin') {
                    const adminCount = await countAdmins();
                    if (adminCount <= 1) {
                        throw new AppError('Cannot remove the last admin', 400);
                    }
                }
            }

            await db.update(profiles).set({ role: role as any }).where(eq(profiles.id, id));
        }

        if (fullName !== undefined || avatarUrl !== undefined) {
            const patch: any = {};
            if (fullName !== undefined) {
                if (fullName !== null && typeof fullName !== 'string') {
                    throw new AppError('Invalid fullName', 400);
                }
                patch.fullName = fullName;
            }
            if (avatarUrl !== undefined) {
                if (avatarUrl !== null && typeof avatarUrl !== 'string') {
                    throw new AppError('Invalid avatarUrl', 400);
                }
                patch.avatarUrl = avatarUrl;
            }

            await db.update(profiles).set(patch).where(eq(profiles.id, id));
        }

        if (isVerified !== undefined) {
            if (typeof isVerified !== 'boolean') {
                throw new AppError('Invalid isVerified', 400);
            }
            await db.update(users).set({ isVerified }).where(eq(users.id, id));
        }

        const [updated] = await db
            .select({
                id: users.id,
                email: users.email,
                isVerified: users.isVerified,
                createdAt: users.createdAt,
                fullName: profiles.fullName,
                role: profiles.role,
                avatarUrl: profiles.avatarUrl,
            })
            .from(users)
            .leftJoin(profiles, eq(users.id, profiles.id))
            .where(eq(users.id, id))
            .limit(1);

        if (!updated) throw new AppError('User not found', 404);

        res.json({
            user: {
                id: updated.id,
                email: updated.email,
                isVerified: updated.isVerified,
                createdAt: updated.createdAt,
                profile: {
                    fullName: updated.fullName,
                    role: updated.role,
                    avatarUrl: updated.avatarUrl,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!id) throw new AppError('User id is required', 400);
        if (req.user?.id && req.user.id === id) {
            throw new AppError('You cannot delete your own account', 400);
        }

        const [target] = await db
            .select({ id: users.id, role: profiles.role })
            .from(users)
            .leftJoin(profiles, eq(users.id, profiles.id))
            .where(eq(users.id, id))
            .limit(1);

        if (!target) throw new AppError('User not found', 404);

        if (target.role === 'admin') {
            const adminCount = await countAdmins();
            if (adminCount <= 1) {
                throw new AppError('Cannot delete the last admin', 400);
            }
        }

        await db.delete(users).where(eq(users.id, id));

        res.json({ status: 'ok' });
    } catch (error) {
        next(error);
    }
};
