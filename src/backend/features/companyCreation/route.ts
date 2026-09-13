/**
 * Company Routes
 * ─────────────────────────────────────────────────────────────────────────────
 * Base: /api/companies
 *
 * Rules:
 *   - companyName is required.
 *   - companyCode is a unique internal identifier (409 on duplicate).
 *   - companyType is one of: Private | Public | NGO | Government | Other.
 *   - industry is free text (e.g. IT, Construction, Hospitality, Security).
 *   - registrationNumber and panNumber/taxNumber are optional.
 *   - companyLogo stores a URL/path to the uploaded logo.
 *
 * ┌──────────────────────────────────────────────────────┬────────────────────────────────┐
 * │ Endpoint                                             │ Handler                        │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ GET    /api/companies                                │ getAllCompanies                │
 * │        ?search, ?companyType, ?industry,             │ Paginated list + filters       │
 * │        ?page, ?limit                                 │                                │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ GET    /api/companies/:id                            │ getCompanyById                 │
 * │                                                      │ Single company by UUID         │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ GET    /api/companies/code/:companyCode              │ getCompanyByCode               │
 * │                                                      │ Single company by companyCode  │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ POST   /api/companies                                │ createCompany                  │
 * │        { companyName, companyCode, companyType,      │                                │
 * │          industry, registrationNumber?,              │                                │
 * │          panNumber?, companyDescription?,            │                                │
 * │          companyLogo? }                              │                                │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ PUT    /api/companies/:id                            │ updateCompany                  │
 * │        { any subset of create fields }               │ Partial update                 │
 * ├──────────────────────────────────────────────────────┼────────────────────────────────┤
 * │ DELETE /api/companies/:id                            │ deleteCompany                  │
 * └──────────────────────────────────────────────────────┴────────────────────────────────┘
 */

export {
  getAllCompanies,
  getCompanyById,
  getCompanyByCode,
  registerCompany,
  createCompany,
  updateCompany,
  deleteCompany,
} from "./companyController";

export const COMPANY_ROUTES = {
  list:     "GET    /api/companies",
  get:      "GET    /api/companies/:id",
  getByCode:"GET    /api/companies/code/:companyCode",
  register: "POST   /api/companies/register",   // public — demo request
  create:   "POST   /api/companies",            // admin only
  update:   "PUT    /api/companies/:id",
  delete:   "DELETE /api/companies/:id",
} as const;