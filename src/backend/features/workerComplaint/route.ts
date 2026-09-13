/**
 * Worker Complaint Routes
 * ─────────────────────────────────────────────────────────────────────────────
 * Base: /api/worker-complaints
 *
 * Rules:
 *   - Every complaint is filed by a company against a worker,
 *     tied to a specific onboarding/placement.
 *   - Foreign keys: companyId    → companies,
 *                   workerId     → workers,
 *                   onboardingId → onboardings.
 *   - category: attendance | misconduct | performance | policy_violation
 *               | damage | other.
 *   - severity: low | medium | high | critical.
 *   - status lifecycle: open → under_review → resolved | dismissed.
 *   - resolvedAt is auto-set when status becomes resolved / dismissed.
 *
 * ┌──────────────────────────────────────────────────────┬────────────────────────────────┐
 * │ Endpoint                                             │ Handler                        │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ GET    /api/worker-complaints                        │ getAllComplaints               │
 * │        ?status, ?severity, ?category, ?companyId,    │ Paginated list + filters       │
 * │        ?workerId, ?onboardingId, ?search,            │                                │
 * │        ?page, ?limit                                 │                                │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ GET    /api/worker-complaints/:id                    │ getComplaintById               │
 * │                                                      │ Single complaint + joins       │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ POST   /api/worker-complaints                        │ createComplaint                │
 * │        { companyId, workerId, onboardingId, title,   │ Company files a complaint      │
 * │          description, category, severity }           │                                │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ PATCH  /api/worker-complaints/:id                    │ updateComplaint                │
 * │        { status?, adminNote?, resolution?,           │ Admin resolves / updates       │
 * │          severity?, category?, title?,               │                                │
 * │          description? }                              │                                │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ DELETE /api/worker-complaints/:id                    │ deleteComplaint                │
 * └──────────────────────────────────────────────────────┴────────────────────────────────┘
 */

export {
  getAllComplaints,
  getComplaintById,
  createComplaint,
  updateComplaint,
  deleteComplaint,
} from "./workerComplaintController";

export const WORKER_COMPLAINT_ROUTES = {
  list:   "GET    /api/worker-complaints",
  get:    "GET    /api/worker-complaints/:id",
  create: "POST   /api/worker-complaints",
  update: "PATCH  /api/worker-complaints/:id",
  delete: "DELETE /api/worker-complaints/:id",
} as const;