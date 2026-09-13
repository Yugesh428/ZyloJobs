import { NextRequest } from "next/server";
import { getMe, updateMe } from "@/backend/features/worker/workerController";

export async function GET(req: NextRequest) {
  return getMe(req);
}

export async function PUT(req: NextRequest) {
  return updateMe(req);
}
