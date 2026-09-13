/**
 * Job Category Routes
 * ─────────────────────────────────────────────────────────────────────────────
 * Base: /api/job-categories
 *
 * Rules:
 *   - name is required and unique.
 *   - code is a unique internal identifier (409 on duplicate).
 *   - isActive controls whether the category is selectable in new requests.
 *
 * ┌──────────────────────────────────────────────────────┬────────────────────────────────┐
 * │ Endpoint                                             │ Handler                        │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ GET    /api/job-categories                           │ getAllJobCategories            │
 * │        ?search, ?isActive, ?page, ?limit             │ Paginated list + filters       │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ GET    /api/job-categories/:id                       │ getJobCategoryById             │
 * │                                                      │ Single category by UUID        │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ GET    /api/job-categories/code/:code                │ getJobCategoryByCode           │
 * │                                                      │ Single category by code        │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ POST   /api/job-categories                           │ createJobCategory              │
 * │        { name, code, description?, isActive? }       │                                │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ PUT    /api/job-categories/:id                       │ updateJobCategory              │
 * │        { any subset of create fields }               │ Partial update                 │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ DELETE /api/job-categories/:id                       │ deleteJobCategory              │
 * └──────────────────────────────────────────────────────┴────────────────────────────────┘
 */

export {
  getAllJobCategories,
  getJobCategoryById,
  getJobCategoryByCode,
  createJobCategory,
  updateJobCategory,
  deleteJobCategory,
} from "./jobCategoryController";

export const JOB_CATEGORY_ROUTES = {
  list: "GET    /api/job-categories",
  get: "GET    /api/job-categories/:id",
  getByCode: "GET    /api/job-categories/code/:code",
  create: "POST   /api/job-categories",
  update: "PUT    /api/job-categories/:id",
  delete: "DELETE /api/job-categories/:id",
} as const;
