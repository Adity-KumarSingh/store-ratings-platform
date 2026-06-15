import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../config/db';
import { UserRecord } from '../types';
import { buildOrderBy } from '../utils/sort';

const USER_SORT_COLUMNS: Record<string, string> = {
  name: 'u.name',
  email: 'u.email',
  address: 'u.address',
  role: 'u.role',
  createdAt: 'u.created_at',
};

export async function createUser(req: Request, res: Response) {
  const { name, email, password, address, role } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  const { rows } = await query<UserRecord>(
    `INSERT INTO users (name, email, password, address, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, address, role, created_at`,
    [name, email, hashed, address, role ?? 'user'],
  );
  res.status(201).json({ user: rows[0] });
}

export async function listUsers(req: Request, res: Response) {
  const { name, email, address, role, sortBy, order } = req.query;
  const where: string[] = [];
  const params: unknown[] = [];

  const addFilter = (column: string, value: unknown) => {
    if (typeof value === 'string' && value.trim() !== '') {
      params.push(`%${value.trim()}%`);
      where.push(`u.${column} ILIKE $${params.length}`);
    }
  };
  addFilter('name', name);
  addFilter('email', email);
  addFilter('address', address);
  if (typeof role === 'string' && role.trim() !== '') {
    params.push(role.trim());
    where.push(`u.role = $${params.length}`);
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const orderBy = buildOrderBy(sortBy, order, USER_SORT_COLUMNS, 'u.name');

  const { rows } = await query(
    `SELECT u.id, u.name, u.email, u.address, u.role, u.created_at,
            CASE WHEN u.role = 'owner'
                 THEN ROUND(AVG(r.rating)::numeric, 2)
                 ELSE NULL END AS rating
       FROM users u
       LEFT JOIN stores s ON s.owner_id = u.id
       LEFT JOIN ratings r ON r.store_id = s.id
       ${whereClause}
       GROUP BY u.id
       ${orderBy}`,
    params,
  );
  res.json({ users: rows });
}

export async function getUser(req: Request, res: Response) {
  const id = parseInt(req.params.id, 10);
  const { rows } = await query(
    `SELECT u.id, u.name, u.email, u.address, u.role, u.created_at,
            CASE WHEN u.role = 'owner'
                 THEN ROUND(AVG(r.rating)::numeric, 2)
                 ELSE NULL END AS rating
       FROM users u
       LEFT JOIN stores s ON s.owner_id = u.id
       LEFT JOIN ratings r ON r.store_id = s.id
      WHERE u.id = $1
      GROUP BY u.id`,
    [id],
  );
  if (!rows[0]) return res.status(404).json({ message: 'User not found.' });
  res.json({ user: rows[0] });
}

export async function updateUserRole(req: Request, res: Response) {
  const id = parseInt(req.params.id, 10);
  const { role } = req.body;
  if (req.user!.id === id) {
    return res.status(400).json({ message: 'You cannot change your own role.' });
  }
  const { rows } = await query(
    `UPDATE users SET role = $1, updated_at = now()
      WHERE id = $2
      RETURNING id, name, email, address, role`,
    [role, id],
  );
  if (!rows[0]) return res.status(404).json({ message: 'User not found.' });
  res.json({ user: rows[0] });
}

export async function deleteUser(req: Request, res: Response) {
  const id = parseInt(req.params.id, 10);
  if (req.user!.id === id) {
    return res.status(400).json({ message: 'You cannot delete your own account.' });
  }
  const { rowCount } = await query(`DELETE FROM users WHERE id = $1`, [id]);
  if (!rowCount) return res.status(404).json({ message: 'User not found.' });
  res.json({ message: 'User deleted.' });
}

export async function dashboardStats(_req: Request, res: Response) {
  const { rows } = await query(
    `SELECT
       (SELECT COUNT(*) FROM users)   AS total_users,
       (SELECT COUNT(*) FROM stores)  AS total_stores,
       (SELECT COUNT(*) FROM ratings) AS total_ratings`,
  );
  const row = rows[0];
  res.json({
    totalUsers: Number(row.total_users),
    totalStores: Number(row.total_stores),
    totalRatings: Number(row.total_ratings),
  });
}
