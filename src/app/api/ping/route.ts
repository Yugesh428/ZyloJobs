export const runtime = "nodejs";

export async function GET() {
  return Response.json({ 
    message: "pong", 
    timestamp: new Date().toISOString(),
    env: {
      hasDbUrl: !!process.env.DATABASE_URL,
      hasAuthSecret: !!process.env.AUTH_SECRET,
    }
  });
}
