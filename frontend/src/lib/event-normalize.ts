export type NormalizedEvent = {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  category: string;
  capacity: number | null;
  registration_fee: number | null;
  image_url: string;
  status: string;
  organizer_id: string;
  created_at: string;
};

const toStringSafe = (value: unknown, fallback = ''): string => {
  if (value === null || value === undefined) return fallback;
  return String(value);
};

const toNumberOrNull = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const asNumber = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(asNumber) ? asNumber : null;
};

export const normalizeEvent = (raw: any): NormalizedEvent => {
  const start = raw?.start_date ?? raw?.startDate ?? '';
  const end = raw?.end_date ?? raw?.endDate ?? '';

  return {
    id: toStringSafe(raw?.id),
    title: toStringSafe(raw?.title),
    description: toStringSafe(raw?.description),
    start_date: toStringSafe(start),
    end_date: toStringSafe(end),
    location: toStringSafe(raw?.location),
    category: toStringSafe(raw?.category),
    capacity: toNumberOrNull(raw?.capacity ?? raw?.max_participants ?? raw?.maxParticipants),
    registration_fee: toNumberOrNull(raw?.registration_fee ?? raw?.registrationFee ?? raw?.price),
    image_url: toStringSafe(raw?.image_url ?? raw?.imageUrl),
    status: toStringSafe(raw?.status),
    organizer_id: toStringSafe(raw?.organizer_id ?? raw?.organizerId),
    created_at: toStringSafe(raw?.created_at ?? raw?.createdAt),
  };
};

export const parseEventDate = (value: string): Date | null => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};
