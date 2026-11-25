import { cookies } from 'next/headers';
import { prisma } from './prisma';

const SESSION_COOKIE = 'campusconnect_user_id';

export async function createSession(userId: number) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, String(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 jours
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const rawId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!rawId) return null;

  const userId = Number(rawId);
  if (isNaN(userId)) return null;

  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      specialite: true,
      niveau: true,
      skills: true,
    },
  });
}