import { NextRequest } from "next/server";
import { registerWorker } from "@/backend/features/worker/workerController";

export async function POST(req: NextRequest) {
  return registerWorker(req);
}
