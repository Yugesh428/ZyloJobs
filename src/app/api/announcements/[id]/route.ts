/**
 * GET    /api/announcements/[id]  — get single announcement
 * PATCH  /api/announcements/[id]  — update announcement
 * DELETE /api/announcements/[id]  — delete announcement (admin only)
 */
export const runtime = "nodejs";

import { type NextRequest } from "next/server";
import {
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement,
} from "@/backend/features/Announcement/announcementController";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return getAnnouncementById(req, id);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return updateAnnouncement(req, id);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return deleteAnnouncement(req, id);
}
