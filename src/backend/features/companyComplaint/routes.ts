/**
 * Company Complaint Routes
 * ─────────────────────────────────────────────────────────────────────────────
 * Base: /api/company-complaints
 *
 * Rules:
 *   - Every complaint is filed by a WORKER against a COMPANY,
 *     tied to a specific onboarding/placement.
 *   - Foreign keys: workerId     → workers    (who filed it),
 *                   companyId    → companies  (who it's against),
 *                   onboardingId → onboardings.
 *   - category (workplace only): harassment | unsafe_conditions
 *               | overwork | discrimination | contract_violation | other.
 *   - severity: low | medium | high | critical.
 *   - status lifecycle: open → under_review → resolved | dismissed.
 *   - isAnonymous: when true, worker identity is hidden from the company
 *     (pass ?asAdmin=true to see the real filer).
 *   - resolvedAt is auto-set when status becomes resolved / dismissed.
 *
 * ┌──────────────────────────────────────────────────────┬────────────────────────────────┐
 * │ Endpoint                                             │ Handler                        │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ GET    /api/company-complaints                       │ getAllCompanyComplaints        │
 * │        ?status, ?severity, ?category, ?workerId,     │ Paginated list + filters       │
 * │        ?companyId, ?onboardingId, ?isAnonymous,      │ ?asAdmin hides anon identity   │
 * │        ?search, ?page, ?limit, ?asAdmin              │                                │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ GET    /api/company-complaints/:id                   │ getCompanyComplaintById        │
 * │        ?asAdmin=true                                 │ Single complaint + joins       │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ POST   /api/company-complaints                       │ createCompanyComplaint         │
 * │        { workerId, companyId, onboardingId, title,   │ Worker files a complaint       │
 * │          description, category, severity,            │                                │
 * │          isAnonymous? }                              │                                │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ PATCH  /api/company-complaints/:id                   │ updateCompanyComplaint         │
 * │        { status?, adminNote?, resolution?,           │ Admin resolves / updates       │
 * │          severity?, category?, title?,               │                                │
 * │          description?, isAnonymous? }                │                                │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ DELETE /api/company-complaints/:id                   │ deleteCompanyComplaint         │
 * └──────────────────────────────────────────────────────┴────────────────────────────────┘
 */

export {
  getAllCompanyComplaints,
  getCompanyComplaintById,
  createCompanyComplaint,
  updateCompanyComplaint,
  deleteCompanyComplaint,
} from "./companyComplaintController";

export const COMPANY_COMPLAINT_ROUTES = {
  list:   "GET    /api/company-complaints",
  get:    "GET    /api/company-complaints/:id",
  create: "POST   /api/company-complaints",
  update: "PATCH  /api/company-complaints/:id",
  delete: "DELETE /api/company-complaints/:id",
} as const;