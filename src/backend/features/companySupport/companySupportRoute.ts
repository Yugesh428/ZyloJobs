/**
 * Company Support Ticket Routes
 * ─────────────────────────────────────────────────────────────────────────────
 * Base: /api/company-support-tickets
 *
 * Rules:
 *   - Every ticket is submitted by a COMPANY (companyId FK, required).
 *   - category (company-specific): billing | worker_quality | staffing
 *               | onboarding | platform | account | other.
 *   - priority: low | medium | high | urgent (default medium).
 *   - status lifecycle: open → in_progress → resolved | closed.
 *   - resolvedAt is auto-set when status becomes resolved / closed.
 *   - assignedTo and adminReply are admin-side fields.
 *
 * ┌──────────────────────────────────────────────────────┬────────────────────────────────┐
 * │ Endpoint                                             │ Handler                        │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ GET    /api/company-support-tickets                  │ getAllCompanySupportTickets    │
 * │        ?status, ?priority, ?category, ?companyId,    │ Paginated list + filters       │
 * │        ?assignedTo, ?search, ?page, ?limit           │                                │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ GET    /api/company-support-tickets/:id              │ getCompanySupportTicketById    │
 * │                                                      │ Single ticket + company        │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ GET    /api/company-support-tickets/company/:id      │ getCompanySupportTicketsBy...  │
 * │        ?status, ?page, ?limit                        │ All tickets for one company    │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ POST   /api/company-support-tickets                  │ createCompanySupportTicket     │
 * │        { companyId, subject, message, category,      │ Company submits a ticket       │
 * │          priority? }                                 │                                │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ PATCH  /api/company-support-tickets/:id              │ updateCompanySupportTicket     │
 * │        { status?, assignedTo?, adminReply?,          │ Admin replies / resolves       │
 * │          priority?, category?, subject?, message? }  │                                │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ DELETE /api/company-support-tickets/:id              │ deleteCompanySupportTicket     │
 * └──────────────────────────────────────────────────────┴────────────────────────────────┘
 */

export {
  getAllCompanySupportTickets,
  getCompanySupportTicketById,
  getCompanySupportTicketsByCompany,
  createCompanySupportTicket,
  updateCompanySupportTicket,
  deleteCompanySupportTicket,
} from "./companySupportController";

export const COMPANY_SUPPORT_TICKET_ROUTES = {
  list:            "GET    /api/company-support-tickets",
  get:             "GET    /api/company-support-tickets/:id",
  listByCompany:   "GET    /api/company-support-tickets/company/:companyId",
  create:          "POST   /api/company-support-tickets",
  update:          "PATCH  /api/company-support-tickets/:id",
  delete:          "DELETE /api/company-support-tickets/:id",
} as const;