import rateLimit from 'express-rate-limit';

export const createRateLimiter = (maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) => {
  // Disable rate limiting in test environment
  if (process.env.NODE_ENV === 'test') {
    return (_req: any, _res: any, next: any) => next();
  }

  // More lenient rate limiting in development
  const isDevelopment = process.env.NODE_ENV === 'development';

  return rateLimit({
    windowMs,
    max: isDevelopment ? maxRequests * 10 : maxRequests, // 10x limit in development
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    // Skip rate limiting for localhost in development
    skip: (req) => {
      if (isDevelopment) {
        const ip = req.ip || req.socket.remoteAddress || '';
        return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1' || ip.includes('localhost');
      }
      return false;
    },
  });
};

// Auth endpoints: 20 requests per 15 minutes (200 in development)
export const authLimiter = createRateLimiter(20, 15 * 60 * 1000);
// General API: 100 requests per 15 minutes (1000 in development)
export const apiLimiter = createRateLimiter(100, 15 * 60 * 1000);
