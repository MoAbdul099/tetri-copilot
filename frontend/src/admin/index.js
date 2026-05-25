/**
 * Platform Administration Boundary — Slice 10.5
 *
 * Future home of all admin.tetricopilot.com features (Slice 19).
 * Platform admin features (plans, features, monitoring) will live here.
 *
 * Target structure:
 *   admin/
 *     routes/       — admin route definitions (/admin/*)
 *     pages/        — admin pages (Plans, Features, Countries, etc.)
 *     layouts/      — AdminLayout shell
 *     features/     — admin feature modules
 *
 * Security: routes under /admin/* must check platform-admin role.
 * Non-platform users must never access /admin/* or /api/admin/*.
 */
