/**
 * GET  /api/announcements  — list all announcements (with filters)
 * POST /api/announcements  — create new announcement (admin only)
 */
export const runtime = "nodejs";

import { type NextRequest } from "next/server";
import {
  getAllAnnouncements,
  createAnnouncement,
} from "@/backend/features/Announcement/announcementController";

export async function GET(req: NextRequest) {
  return getAllAnnouncements(req);
}

export async function POST(req: NextRequest) {
  return createAnnouncement(req);
}
