import type { NextFunction, Request, Response } from 'express';
import { timingSafeEqual } from 'crypto';
import logger from '../utils/logger';

type BasicCredentials = {
    username: string;
    password: string;
};

const parseBasicHeader = (headerValue: string | undefined | null): BasicCredentials | null => {
    if (!headerValue) return null;
    if (!headerValue.startsWith('Basic ')) return null;

    const base64Credentials = headerValue.slice('Basic '.length).trim();
    if (!base64Credentials) return null;

    try {
        const decoded = Buffer.from(base64Credentials, 'base64').toString('utf-8');
        const separatorIndex = decoded.indexOf(':');
        if (separatorIndex === -1) return null;

        return {
            username: decoded.slice(0, separatorIndex),
            password: decoded.slice(separatorIndex + 1),
        };
    } catch {
        return null;
    }
};

const safeEqual = (a: string, b: string): boolean => {
    const aBuf = Buffer.from(a);
    const bBuf = Buffer.from(b);
    if (aBuf.length !== bBuf.length) return false;
    return timingSafeEqual(aBuf, bBuf);
};

const normalizeList = (value: string | undefined): string[] =>
    (value ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

const getFullPath = (req: Request): string => `${req.baseUrl || ''}${req.path || ''}`;

const isSwaggerDocs = (fullPath: string): boolean => fullPath.startsWith('/api-docs');

const sendUnauthorized = (res: Response, fullPath: string, message: string) => {
    if (isSwaggerDocs(fullPath)) {
        // Allows browser to show the Basic Auth login prompt.
        res.setHeader('WWW-Authenticate', 'Basic realm="NGEvent API"');
    }
    return res.status(401).json({ message });
};

/**
 * API Basic Auth gate intended for "extra" protection of sensitive endpoints.
 *
 * Uses a dedicated header (default: X-Basic-Auth) so it doesn't conflict with
 * Authorization: Bearer <jwt> used by normal app auth.
 *
 * IMPORTANT: If you put Basic Auth credentials in a public frontend build,
 * they are not secret. Prefer using this gate for internal/admin endpoints.
 */
export const apiBasicAuth = (req: Request, res: Response, next: NextFunction) => {
    const enabled = (process.env.BASIC_AUTH_ENABLED || '').toLowerCase() === 'true';
    if (!enabled) return next();

    const protectAllApi = (process.env.BASIC_AUTH_PROTECT_ALL_API || '').toLowerCase() === 'true';

    const username = process.env.BASIC_AUTH_USER;
    const password = process.env.BASIC_AUTH_PASS;

    if (!username || !password) {
        logger.warn('BASIC_AUTH_ENABLED=true but BASIC_AUTH_USER/PASS not set; denying request');
        return res.status(503).json({ message: 'Service configuration error' });
    }

    const headerName = process.env.BASIC_AUTH_HEADER || 'X-Basic-Auth';
    const protectPaths = normalizeList(process.env.BASIC_AUTH_PROTECT_PATHS);
    const exemptPaths = normalizeList(process.env.BASIC_AUTH_EXEMPT_PATHS);

    const fullPath = getFullPath(req);

    // Always protect Swagger docs when enabled (unless exempted).
    const swagger = isSwaggerDocs(fullPath);

    const protectedByPrefix = protectPaths.some((p) => fullPath.startsWith(p));
    const shouldGate = swagger || protectAllApi || protectedByPrefix;

    // If no protection is configured, let the request through.
    // This keeps public endpoints (e.g. public event listing) accessible by default.
    if (!shouldGate) {
        return next();
    }

    if (exemptPaths.some((p) => fullPath.startsWith(p))) {
        return next();
    }

    // Prefer the dedicated header; fall back to Authorization if it's Basic.
    const headerValue = req.get(headerName) || req.get('Authorization');
    const credentials = parseBasicHeader(headerValue);

    if (!credentials) {
        return sendUnauthorized(res, fullPath, 'You don\'t have access to this resource');
    }

    if (!safeEqual(credentials.username, username) || !safeEqual(credentials.password, password)) {
        return sendUnauthorized(res, fullPath, 'Invalid basic auth credentials');
    }

    return next();
};
