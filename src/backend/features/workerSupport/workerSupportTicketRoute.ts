/**
 * Support Ticket Routes
 * ─────────────────────────────────────────────────────────────────────────────
 * Base: /api/support-tickets
 *
 * Rules:
 *   - Every ticket is submitted by a WORKER (workerId FK, required).
 *   - category: account | job | onboarding | attendance
 *               | payment | technical | other.
 *   - priority: low | medium | high | urgent (default medium).
 *   - status lifecycle: open → in_progress → resolved | closed.
 *   - resolvedAt is auto-set when status becomes resolved / closed.
 *   - assignedTo and adminReply are admin-side fields.
 *
 * ┌──────────────────────────────────────────────────────┬────────────────────────────────┐
 * │ Endpoint                                             │ Handler                        │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ GET    /api/support-tickets                          │ getAllSupportTickets           │
 * │        ?status, ?priority, ?category, ?workerId,     │ Paginated list + filters       │
 * │        ?assignedTo, ?search, ?page, ?limit           │                                │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ GET    /api/support-tickets/:id                      │ getSupportTicketById           │
 * │                                                      │ Single ticket + worker         │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ GET    /api/support-tickets/worker/:workerId         │ getSupportTicketsByWorker      │
 * │        ?status, ?page, ?limit                        │ All tickets for one worker     │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ POST   /api/support-tickets                          │ createSupportTicket            │
 * │        { workerId, subject, message, category,       │ Worker submits a ticket        │
 * │          priority? }                                 │                                │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ PATCH  /api/support-tickets/:id                      │ updateSupportTicket            │
 * │        { status?, assignedTo?, adminReply?,          │ Admin replies / resolves       │
 * │          priority?, category?, subject?, message? }  │                                │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ DELETE /api/support-tickets/:id                      │ deleteSupportTicket            │
 * └──────────────────────────────────────────────────────┴────────────────────────────────┘
 */

export {
  getAllSupportTickets,
  getSupportTicketById,
  getSupportTicketsByWorker,
  createSupportTicket,
  updateSupportTicket,
  deleteSupportTicket,
} from "./workerSupportTicketController";

export const SUPPORT_TICKET_ROUTES = {
  list:          "GET    /api/support-tickets",
  get:           "GET    /api/support-tickets/:id",
  listByWorker:  "GET    /api/support-tickets/worker/:workerId",
  create:        "POST   /api/support-tickets",
  update:        "PATCH  /api/support-tickets/:id",
  delete:        "DELETE /api/support-tickets/:id",
} as const;