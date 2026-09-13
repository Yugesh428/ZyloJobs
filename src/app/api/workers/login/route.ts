import { NextRequest } from "next/server";
import { loginWorker } from "@/backend/features/worker/workerController";

export async function POST(req: NextRequest) {
  return loginWorker(req);
}
