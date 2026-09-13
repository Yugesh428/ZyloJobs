/**
 * Onboarding Routes
 * ─────────────────────────────────────────────────────────────────────────────
 * Base: /api/onboarding
 *
 * Rules:
 *   - One onboarding record per application (unique applicationId).
 *   - Foreign keys: applicationId → job_applications,
 *                   workerId      → workers,
 *                   jobId         → jobs,
 *                   companyId     → companies (placing company).
 *   - status lifecycle: pending → offer_sent → documents_submitted
 *                       → active → terminated.
 *   - salaryPeriod: monthly | weekly | daily.
 *   - salaryAmount is INTEGER in NPR (Rs.).
 *   - joiningDate must be YYYY-MM-DD.
 *   - Document URLs (offerLetterUrl, contractUrl, citizenshipUrl,
 *     passportUrl, ppPhotoUrl) are uploaded by admin.
 *
 * ┌──────────────────────────────────────────────────────┬────────────────────────────────┐
 * │ Endpoint                                             │ Handler                        │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ GET    /api/onboarding                               │ getAllOnboardings              │
 * │        ?status, ?workerId, ?jobId, ?companyId,       │ Paginated list + filters       │
 * │        ?applicationId, ?page, ?limit                 │                                │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ GET    /api/onboarding/:id                           │ getOnboardingById              │
 * │                                                      │ Single record + joins          │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ POST   /api/onboarding                               │ createOnboarding               │
 * │        { applicationId, workerId, jobId,             │ Admin creates record           │
 * │          companyId, joiningDate, salaryAmount,       │                                │
 * │          salaryPeriod, notes? }                      │                                │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ PATCH  /api/onboarding/:id                           │ updateOnboarding               │
 * │        { status?, offerLetterUrl?, contractUrl?,     │ Status / documents update      │
 * │          citizenshipUrl?, passportUrl?,              │                                │
 * │          ppPhotoUrl?, notes?, joiningDate?,          │                                │
 * │          salaryAmount?, salaryPeriod? }              │                                │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ DELETE /api/onboarding/:id                           │ deleteOnboarding               │
 * └──────────────────────────────────────────────────────┴────────────────────────────────┘
 */

export {
  getAllOnboardings,
  getOnboardingById,
  createOnboarding,
  updateOnboarding,
  deleteOnboarding,
} from "./onBoardingController";

export const ONBOARDING_ROUTES = {
  list:   "GET    /api/onboarding",
  get:    "GET    /api/onboarding/:id",
  create: "POST   /api/onboarding",
  update: "PATCH  /api/onboarding/:id",
  delete: "DELETE /api/onboarding/:id",
} as const;