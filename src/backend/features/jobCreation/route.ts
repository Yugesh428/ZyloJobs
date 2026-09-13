/**
 * Job Routes
 * ─────────────────────────────────────────────────────────────────────────────
 * Base: /api/jobs
 *
 * Rules:
 *   - Jobs are posted generically — no company association.
 *   - status lifecycle: pending → processing → fulfilled | cancelled.
 *   - experienceRequired: Fresher | 1-2 years | 3-5 years | 5+ years.
 *   - workType: On-site | Remote | Hybrid.
 *
 * ┌──────────────────────────────────────────────────────┬────────────────────────────────┐
 * │ Endpoint                                             │ Handler                        │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ GET    /api/jobs                                     │ getAllJobs                     │
 * │        ?search, ?status, ?department, ?workType,     │ Paginated list + filters       │
 * │        ?experienceRequired, ?page, ?limit            │                                │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ GET    /api/jobs/:id                                 │ getJobById                     │
 * │                                                      │ Single job                     │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ POST   /api/jobs                                     │ createJob                      │
 * │        { jobRole, department, numberOfWorkers,       │                                │
 * │          experienceRequired, jobLocation, workType,  │                                │
 * │          workingHours, responsibilities?, status? }  │                                │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ PUT    /api/jobs/:id                                 │ updateJob                      │
 * │        { any subset of create fields }               │ Partial update                 │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ PATCH  /api/jobs/:id/status                          │ updateJobStatus                │
 * │        { status }                                    │ Status-only update             │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ DELETE /api/jobs/:id                                 │ deleteJob                      │
 * └──────────────────────────────────────────────────────┴────────────────────────────────┘
 */

export {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  updateJobStatus,
  deleteJob,
} from "./jobCreationController";

export const JOB_ROUTES = {
  list: "GET    /api/jobs",
  get: "GET    /api/jobs/:id",
  create: "POST   /api/jobs",
  update: "PUT    /api/jobs/:id",
  updateStatus: "PATCH  /api/jobs/:id/status",
  delete: "DELETE /api/jobs/:id",
} as const;
