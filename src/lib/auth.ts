import { getDb } from './db';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'mp3wap-admin-secret-key-2026';
const COOKIE_NAME = 'admin_token';

export interface AdminUser {
  id: number;
  username: string;
  role: string;
  displayName: string;
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function generateToken(user: AdminUser): string {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role, displayName: user.displayName },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

export function verifyToken(token: string): AdminUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return { id: decoded.id, username: decoded.username, role: decoded.role, displayName: decoded.displayName || '' };
  } catch {
    return null;
  }
}

export function authenticateUser(username: string, password: string): { token: string; user: AdminUser } | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;
  if (!row) return null;
  if (!verifyPassword(password, row.password)) return null;
  const user: AdminUser = { id: row.id, username: row.username, role: row.role, displayName: row.displayName };
  const token = generateToken(user);
  return { token, user };
}

export async function getTokenFromCookies(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(COOKIE_NAME)?.value || null;
  } catch {
    return null;
  }
}

export async function getAdminUser(): Promise<AdminUser | null> {
  const token = await getTokenFromCookies();
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAdmin(): Promise<AdminUser> {
  const user = await getAdminUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export { COOKIE_NAME, JWT_SECRET };
