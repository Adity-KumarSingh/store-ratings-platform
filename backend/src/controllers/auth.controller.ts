import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../config/db';
import { signToken } from '../utils/jwt';
import { UserRecord } from '../types';

function publicUser(u: UserRecord) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    address: u.address,
    role: u.role,
  };
}

export async function signup(req: Request, res: Response) {
  const { name, email, password, address } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const { rows } = await query<UserRecord>(
    `INSERT INTO users (name, email, password, address, role)
     VALUES ($1, $2, $3, $4, 'user')
     RETURNING *`,
    [name, email, hashed, address],
  );
  const user = rows[0];
  const token = signToken({ id: user.id, role: user.role, email: user.email });
  res.status(201).json({ token, user: publicUser(user) });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  const { rows } = await query<UserRecord>(
    `SELECT * FROM users WHERE email = $1`,
    [email],
  );
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }
  const token = signToken({ id: user.id, role: user.role, email: user.email });
  res.json({ token, user: publicUser(user) });
}

export async function me(req: Request, res: Response) {
  const { rows } = await query<UserRecord>(
    `SELECT * FROM users WHERE id = $1`,
    [req.user!.id],
  );
  if (!rows[0]) return res.status(404).json({ message: 'User not found.' });
  res.json({ user: publicUser(rows[0]) });
}

export async function updatePassword(req: Request, res: Response) {
  const { currentPassword, newPassword } = req.body;
  const { rows } = await query<UserRecord>(
    `SELECT * FROM users WHERE id = $1`,
    [req.user!.id],
  );
  const user = rows[0];
  if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
    return res.status(401).json({ message: 'Current password is incorrect.' });
  }
  const hashed = await bcrypt.hash(newPassword, 10);
  await query(`UPDATE users SET password = $1, updated_at = now() WHERE id = $2`, [
    hashed,
    user.id,
  ]);
  res.json({ message: 'Password updated successfully.' });
}
