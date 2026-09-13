/**
 * Worker Request Routes
 * ─────────────────────────────────────────────────────────────────────────────
 * Base: /api/worker-requests
 *
 * ┌──────────────────────────────────────────────────┬──────────────────────────────────────┐
 * │ Endpoint                                         │ Handler                              │
 * ├──────────────────────────────────────────────────┼──────────────────────────────────────┤
 * │ GET  /api/worker-requests                        │ getAllWorkerRequests                  │
 * │      ?search, ?companyId, ?department,           │ Paginated list + filters             │
 * │      ?experienceRequired, ?workType,             │ Each item includes full company info  │
 * │      ?status, ?page, ?limit                      │ (password excluded)                  │
 * ├──────────────────────────────────────────────────┼──────────────────────────────────────┤
 * │ GET  /api/worker-requests/:id                    │ getWorkerRequestById                 │
 * │                                                  │ Includes full company info            │
 * ├──────────────────────────────────────────────────┼──────────────────────────────────────┤
 * │ GET  /api/worker-requests/company/:companyId     │ getWorkerRequestsByCompany           │
 * │      ?status, ?page, ?limit                      │ All requests for a company           │
 * ├──────────────────────────────────────────────────┼──────────────────────────────────────┤
 * │ POST /api/worker-requests                        │ createWorkerRequest                  │
 * │      { companyId, department, numberOfWorkers,   │ companyId required + validated       │
 * │        jobRole, requiredSkills?, experienceReq., │ Response includes full company info  │
 * │        jobLocation, workType, workingHours,      │                                      │
 * │        responsibilities? }                       │                                      │
 * ├──────────────────────────────────────────────────┼──────────────────────────────────────┤
 * │ PUT  /api/worker-requests/:id                    │ updateWorkerRequest                  │
 * │      { any subset of create fields + status? }   │ Partial update                       │
 * ├──────────────────────────────────────────────────┼──────────────────────────────────────┤
 * │ DELETE /api/worker-requests/:id                  │ deleteWorkerRequest                  │
 * └──────────────────────────────────────────────────┴──────────────────────────────────────┘
 */

export {
  getAllWorkerRequests,
  getWorkerRequestById,
  getWorkerRequestsByCompany,
  createWorkerRequest,
  updateWorkerRequest,
  deleteWorkerRequest,
} from "./workerRequestController";

export const WORKER_REQUEST_ROUTES = {
  list:       "GET    /api/worker-requests",
  get:        "GET    /api/worker-requests/:id",
  byCompany:  "GET    /api/worker-requests/company/:companyId",
  create:     "POST   /api/worker-requests",
  update:     "PUT    /api/worker-requests/:id",
  delete:     "DELETE /api/worker-requests/:id",
} as const;
