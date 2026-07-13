import { cookies } from "next/headers";

export const ALLOWED_ADMINS = ["webstrixx@gmail.com", "office.hsga@gmail.com"];

export async function verifyAdminSession(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const adminEmail = cookieStore.get("admin_session")?.value;
    if (!adminEmail) {
      return null;
    }
    const targetEmail = adminEmail.toLowerCase().trim();
    if (!ALLOWED_ADMINS.includes(targetEmail)) {
      return null;
    }
    return targetEmail;
  } catch (err) {
    console.error("verifyAdminSession error:", err);
    return null;
  }
}
