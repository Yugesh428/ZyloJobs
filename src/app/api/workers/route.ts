import { NextRequest } from "next/server";
import { getAllWorkers } from "@/backend/features/worker/workerController";

/**
 * GET /api/workers — Admin only, list all workers with filters + pagination
 * Query params: page, limit, search, jobCategory, location, status, availability
 */
export async function GET(req: NextRequest) {
  return getAllWorkers(req);
}
