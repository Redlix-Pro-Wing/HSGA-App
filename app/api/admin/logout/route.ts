import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("admin_session");
    return NextResponse.json({ success: true, message: "Logged out successfully." });
  } catch (err) {
    console.error("Logout route error:", err);
    return NextResponse.json({ error: "Failed to logout session." }, { status: 500 });
  }
}
