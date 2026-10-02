import { cookies } from "next/headers";

const SESSION_COOKIE = "njis-session";

export async function isAuthenticated() {
  const cookieStore = await cookies();

  const session = cookieStore.get(
    SESSION_COOKIE
  )?.value;

  const expectedSession =
    process.env.NJIS_SESSION_SECRET;

  if (!session || !expectedSession) {
    return false;
  }

  return session === expectedSession;
}