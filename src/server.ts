import express from 'express';
import cors from 'cors';
// @ts-ignore
import helmet from 'helmet';
// @ts-ignore
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import './config/database.js';
import { errorHandler, notFound } from './middleware/error.js';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();

// ── Request Logger ───────────────────────────────────────
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${res.statusCode} ${req.originalUrl} - ${duration}ms`);
    });
    next();
});

// ── Security ─────────────────────────────────────────────
app.use(helmet());
app.use(
    cors({
        origin: env.CORS_ORIGIN,
        credentials: true,
    })
);

// ── Rate Limiting ────────────────────────────────────────
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5000, // Increased for CMS usage
    message: 'Too many requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter);

// ── Body Parsing & Cookies ──────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Health Check ─────────────────────────────────────────
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API Routes ───────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/admin', adminRoutes);

// ── Error Handling ───────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Export for Vercel ─────────────────────────────────────
export default app;

// ── Start Server ─────────────────────────────────────────
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    app.listen(env.PORT, () => {
        console.log(` Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
        console.log(` http://localhost:${env.PORT}`);
    });
}
