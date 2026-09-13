import { NextRequest } from "next/server";
import { changePassword } from "@/backend/features/worker/workerController";

export async function PUT(req: NextRequest) {
  return changePassword(req);
}
