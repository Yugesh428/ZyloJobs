/**
 * Interview Routes
 * ─────────────────────────────────────────────────────────────────────────────
 * Base: /api/interviews
 *
 * Rules:
 *   - Admin schedules interviews for shortlisted job applications.
 *   - Each interview is tied to: applicationId, workerId, jobId.
 *   - type: in-person | phone | video.
 *   - status: scheduled | confirmed | completed | cancelled | no-show.
 *   - round: supports multiple interview rounds for the same application.
 *   - scheduledAt: ISO date-time when interview is scheduled.
 *   - durationMinutes: default 30 minutes.
 *   - location: required for in-person interviews.
 *   - meetingLink: required for phone/video interviews.
 *   - feedback: filled by admin after interview completion.
 *   - notes: admin notes visible to internal team.
 *
 * ┌──────────────────────────────────────────────────────┬────────────────────────────────┐
 * │ Endpoint                                             │ Handler                        │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ POST   /api/interviews                               │ createInterview                │
 * │        Body: { applicationId, workerId, jobId,       │ Admin schedules interview      │
 * │        type, scheduledAt, durationMinutes?,          │                                │
 * │        location?, meetingLink?, notes?, round? }     │                                │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ GET    /api/interviews/application/:applicationId    │ getInterviewsByApplication     │
 * │        Returns all interview rounds for app          │                                │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ GET    /api/interviews/worker/:workerId              │ getInterviewsByWorker          │
 * │        Returns all interviews for a worker           │                                │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ GET    /api/interviews/:id                           │ getInterviewById               │
 * │        Single interview detail                       │                                │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ PATCH  /api/interviews/:id                           │ updateInterview                │
 * │        Body: { type?, scheduledAt?, durationMinutes?,│ Admin updates interview        │
 * │        location?, meetingLink?, notes?, feedback?,   │                                │
 * │        status? }                                     │                                │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ DELETE /api/interviews/:id                           │ deleteInterview                │
 * │        Admin cancels and removes interview           │                                │
 * └──────────────────────────────────────────────────────┴────────────────────────────────┘
 */

export {
  getAllInterviews,
  createInterview,
  getInterviewsByApplication,
  getInterviewsByWorker,
  getInterviewById,
  updateInterview,
  deleteInterview,
} from "./interviewController";

export const INTERVIEW_ROUTES = {
  getAll:        "GET    /api/interviews?page&limit&status&type",
  create:        "POST   /api/interviews",
  getByApp:      "GET    /api/interviews/application/:applicationId",
  getByWorker:   "GET    /api/interviews/worker/:workerId",
  getById:       "GET    /api/interviews/:id",
  update:        "PATCH  /api/interviews/:id",
  delete:        "DELETE /api/interviews/:id",
} as const;
