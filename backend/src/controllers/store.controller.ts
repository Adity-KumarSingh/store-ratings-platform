import { Request, Response } from 'express';
import { query } from '../config/db';
import { buildOrderBy } from '../utils/sort';

const STORE_SORT_COLUMNS: Record<string, string> = {
  name: 's.name',
  email: 's.email',
  address: 's.address',
  rating: 'rating',
  createdAt: 's.created_at',
};

export async function createStore(req: Request, res: Response) {
  const { name, email, address, ownerId } = req.body;

  if (ownerId != null) {
    const { rows } = await query(`SELECT id, role FROM users WHERE id = $1`, [ownerId]);
    if (!rows[0]) return res.status(400).json({ message: 'Owner user not found.' });

    if (rows[0].role !== 'owner') {
      await query(`UPDATE users SET role = 'owner', updated_at = now() WHERE id = $1`, [ownerId]);
    }
  }

  const { rows } = await query(
    `INSERT INTO stores (name, email, address, owner_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, address, owner_id, created_at`,
    [name, email, address, ownerId ?? null],
  );
  res.status(201).json({ store: rows[0] });
}

export async function deleteStore(req: Request, res: Response) {
  const id = parseInt(req.params.id, 10);
  const { rowCount } = await query(`DELETE FROM stores WHERE id = $1`, [id]);
  if (!rowCount) return res.status(404).json({ message: 'Store not found.' });
  res.json({ message: 'Store deleted.' });
}

export async function listStores(req: Request, res: Response) {
  const { name, address, email, sortBy, order } = req.query;
  const userId = req.user!.id;

  const where: string[] = [];
  const params: unknown[] = [userId];

  const addFilter = (column: string, value: unknown) => {
    if (typeof value === 'string' && value.trim() !== '') {
      params.push(`%${value.trim()}%`);
      where.push(`s.${column} ILIKE $${params.length}`);
    }
  };
  addFilter('name', name);
  addFilter('address', address);
  addFilter('email', email);

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const orderBy = buildOrderBy(sortBy, order, STORE_SORT_COLUMNS, 's.name');

  const { rows } = await query(
    `SELECT s.id, s.name, s.email, s.address, s.owner_id,
            COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) AS rating,
            COUNT(r.id) AS rating_count,
            ur.rating AS user_rating
       FROM stores s
       LEFT JOIN ratings r  ON r.store_id = s.id
       LEFT JOIN ratings ur ON ur.store_id = s.id AND ur.user_id = $1
       ${whereClause}
       GROUP BY s.id, ur.rating
       ${orderBy}`,
    params,
  );

  res.json({
    stores: rows.map((s: any) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      address: s.address,
      ownerId: s.owner_id,
      overallRating: Number(s.rating),
      ratingCount: Number(s.rating_count),
      userRating: s.user_rating ?? null,
    })),
  });
}

export async function ownerDashboard(req: Request, res: Response) {
  const ownerId = req.user!.id;

  const { rows: stores } = await query(
    `SELECT s.id, s.name, s.email, s.address,
            COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) AS average_rating,
            COUNT(r.id) AS rating_count
       FROM stores s
       LEFT JOIN ratings r ON r.store_id = s.id
      WHERE s.owner_id = $1
      GROUP BY s.id
      ORDER BY s.name`,
    [ownerId],
  );

  const storeIds = stores.map((s: any) => s.id);
  let raters: any[] = [];
  if (storeIds.length) {
    const { rows } = await query(
      `SELECT r.store_id, u.id AS user_id, u.name, u.email, u.address,
              r.rating, r.updated_at
         FROM ratings r
         JOIN users u ON u.id = r.user_id
        WHERE r.store_id = ANY($1::int[])
        ORDER BY r.updated_at DESC`,
      [storeIds],
    );
    raters = rows;
  }

  res.json({
    stores: stores.map((s: any) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      address: s.address,
      averageRating: Number(s.average_rating),
      ratingCount: Number(s.rating_count),
      raters: raters
        .filter((r) => r.store_id === s.id)
        .map((r) => ({
          userId: r.user_id,
          name: r.name,
          email: r.email,
          address: r.address,
          rating: r.rating,
          ratedAt: r.updated_at,
        })),
    })),
  });
}
