import { Request, Response } from 'express';
import { query } from '../config/db';

export async function submitRating(req: Request, res: Response) {
  const userId = req.user!.id;
  const { storeId, rating } = req.body;

  const { rows: storeRows } = await query(`SELECT id FROM stores WHERE id = $1`, [storeId]);
  if (!storeRows[0]) return res.status(404).json({ message: 'Store not found.' });

  const { rows } = await query(
    `INSERT INTO ratings (user_id, store_id, rating)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, store_id)
     DO UPDATE SET rating = EXCLUDED.rating, updated_at = now()
     RETURNING id, store_id, rating, updated_at`,
    [userId, storeId, rating],
  );

  res.status(201).json({ rating: rows[0] });
}
