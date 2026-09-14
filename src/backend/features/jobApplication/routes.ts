/**
 * Job Application Routes
 * ─────────────────────────────────────────────────────────────────────────────
 * Base: /api/applications
 *
 * Rules:
 *   - Workers apply to jobs by submitting an application.
 *   - Each application is tied to: workerId, jobId.
 *   - Optional CV upload (PDF / DOC / DOCX, max 5 MB).
 *   - Optional coverNote text field.
 *   - Status lifecycle: applied → reviewing → shortlisted | rejected | hired.
 *   - Workers can view their own applications.
 *   - Admin can view all applications with pagination and filters.
 *   - Admin can view all applications for a specific job.
 *   - Admin can update application status.
 *   - Workers can withdraw (delete) their application.
 *
 * ┌──────────────────────────────────────────────────────┬────────────────────────────────┐
 * │ Endpoint                                             │ Handler                        │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ GET    /api/applications?page&limit&status           │ getAllApplications             │
 * │        Returns all applications with pagination      │ Admin view with job/worker     │
 * │        Supports filters: ?status=<status>            │ details via joins              │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ POST   /api/applications                             │ createApplication              │
 * │        Body: multipart/form-data                     │ Worker submits application     │
 * │        { jobId, workerId, coverNote?, cv? }          │                                │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ GET    /api/applications/me?workerId=<id>            │ getMyApplications              │
 * │        Returns all applications for a worker         │                                │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ GET    /api/applications/job/:jobId                  │ getApplicationsByJob           │
 * │        Returns all applicants for a job (admin)      │                                │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ PATCH  /api/applications/:id/status                  │ updateApplicationStatus        │
 * │        Body: { status }                              │ Admin updates status           │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ DELETE /api/applications/:id                         │ deleteApplication              │
 * │        Worker withdraws application                  │                                │
 * └──────────────────────────────────────────────────────┴────────────────────────────────┘
 */

export {
  getAllApplications,
  createApplication,
  getMyApplications,
  getApplicationsByJob,
  updateApplicationStatus,
  deleteApplication,
} from "./jobApplicationController";

export const JOB_APPLICATION_ROUTES = {
  getAll:       "GET    /api/applications?page&limit&status",
  create:       "POST   /api/applications",
  getMyApps:    "GET    /api/applications/me?workerId=<id>",
  getByJob:     "GET    /api/applications/job/:jobId",
  updateStatus: "PATCH  /api/applications/:id/status",
  delete:       "DELETE /api/applications/:id",
} as const;
