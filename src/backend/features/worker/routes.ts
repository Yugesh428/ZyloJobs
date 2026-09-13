/**
 * Worker Routes
 * ─────────────────────────────────────────────────────────────────────────────
 * Base: /api/workers
 *
 * Workers are customers — they can self-register and login directly.
 * No admin approval needed, status starts as "active".
 *
 * ┌──────────────────────────────────────────────────┬──────────────────────────────┐
 * │ Endpoint                                         │ Handler                      │
 * ├──────────────────────────────────────────────────┼──────────────────────────────┤
 * │ POST   /api/workers/register                     │ registerWorker               │
 * │        Public — self-registration + JWT          │ Returns JWT token            │
 * ├──────────────────────────────────────────────────┼──────────────────────────────┤
 * │ POST   /api/workers/login                        │ loginWorker                  │
 * │        Public — email/password → JWT             │ Returns JWT token            │
 * ├──────────────────────────────────────────────────┼──────────────────────────────┤
 * │ GET    /api/workers/me                           │ getMe                        │
 * │        Auth — worker's own profile               │ Requires Bearer token        │
 * ├──────────────────────────────────────────────────┼──────────────────────────────┤
 * │ PUT    /api/workers/me                           │ updateMe                     │
 * │        Auth — update own profile                 │ Requires Bearer token        │
 * ├──────────────────────────────────────────────────┼──────────────────────────────┤
 * │ PUT    /api/workers/me/password                  │ changePassword               │
 * │        Auth — change own password                │ Requires Bearer token        │
 * ├──────────────────────────────────────────────────┼──────────────────────────────┤
 * │ GET    /api/workers                              │ getAllWorkers                │
 * │        Admin — list all workers                  │ Filter + pagination          │
 * ├──────────────────────────────────────────────────┼──────────────────────────────┤
 * │ GET    /api/workers/:id                          │ getWorkerById                │
 * │        Admin — single worker                     │                              │
 * ├──────────────────────────────────────────────────┼──────────────────────────────┤
 * │ PUT    /api/workers/:id                          │ updateWorkerByAdmin          │
 * │        Admin — update status/availability        │                              │
 * ├──────────────────────────────────────────────────┼──────────────────────────────┤
 * │ DELETE /api/workers/:id                          │ deleteWorker                 │
 * │        Admin — delete worker                     │                              │
 * └──────────────────────────────────────────────────┴──────────────────────────────┘
 */

export {
  registerWorker,
  loginWorker,
  getMe,
  updateMe,
  changePassword,
  getAllWorkers,
  getWorkerById,
  updateWorkerByAdmin,
  deleteWorker,
} from "./workerController";

export const WORKER_ROUTES = {
  register:        "POST   /api/workers/register",
  login:           "POST   /api/workers/login",
  me:              "GET    /api/workers/me",
  updateMe:        "PUT    /api/workers/me",
  changePassword:  "PUT    /api/workers/me/password",
  list:            "GET    /api/workers",
  get:             "GET    /api/workers/:id",
  updateByAdmin:   "PUT    /api/workers/:id",
  delete:          "DELETE /api/workers/:id",
} as const;
