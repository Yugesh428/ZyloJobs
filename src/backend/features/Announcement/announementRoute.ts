/**
 * Announcement Routes
 * ─────────────────────────────────────────────────────────────────────────────
 * Base: /api/announcements
 *
 * Rules:
 *   - type: info | warning | alert | update.
 *   - audience: all | workers | companies.
 *   - isPublished: false = draft, true = visible (default false).
 *   - publishedAt is auto-set when isPublished flips to true.
 *   - expiresAt: after this date the announcement is no longer shown.
 *   - activeOnly=true filters out unpublished and expired announcements
 *     (public/worker/company fetches).
 *   - ?audience=X returns X + "all" (since "all" is visible to everyone).
 *
 * ┌──────────────────────────────────────────────────────┬────────────────────────────────┐
 * │ Endpoint                                             │ Handler                        │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ GET    /api/announcements                            │ getAllAnnouncements            │
 * │        ?type, ?audience, ?isPublished, ?createdBy,   │ Paginated list + filters       │
 * │        ?activeOnly, ?search, ?page, ?limit           │                                │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ GET    /api/announcements/:id                        │ getAnnouncementById            │
 * │                                                      │ Single announcement            │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ POST   /api/announcements                            │ createAnnouncement             │
 * │        { title, body, type, audience, createdBy,     │ Admin creates draft or live    │
 * │          expiresAt?, isPublished? }                  │                                │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ PATCH  /api/announcements/:id                        │ updateAnnouncement             │
 * │        { title?, body?, type?, audience?,            │ Edit or publish                │
 * │          createdBy?, expiresAt?, isPublished? }      │                                │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ DELETE /api/announcements/:id                        │ deleteAnnouncement             │
 * └──────────────────────────────────────────────────────┴────────────────────────────────┘
 *
 * Example public fetch:
 *   GET /api/announcements?audience=workers&activeOnly=true
 */

export {
  getAllAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "./announcementController";

export const ANNOUNCEMENT_ROUTES = {
  list:   "GET    /api/announcements",
  get:    "GET    /api/announcements/:id",
  create: "POST   /api/announcements",
  update: "PATCH  /api/announcements/:id",
  delete: "DELETE /api/announcements/:id",
} as const;