import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { pool } from '../config/db';
import { env } from '../config/env';

async function seed() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  await pool.query(schema);

  const hash = (pw: string) => bcrypt.hashSync(pw, 10);

  await pool.query(
    `INSERT INTO users (name, email, password, address, role)
     VALUES ($1, $2, $3, $4, 'admin')
     ON CONFLICT (email) DO NOTHING`,
    [env.seedAdmin.name, env.seedAdmin.email, hash(env.seedAdmin.password), env.seedAdmin.address],
  );

  const normalUsers = [
    ['Jonathan Edward Richardson', 'john.normal@example.com', '12 Maple Street, Springfield'],
    ['Amelia Charlotte Whitmore', 'amelia.user@example.com', '88 River Road, Lakeside'],
    ['Benjamin Alexander Carter', 'ben.user@example.com', '5 Oak Avenue, Hilltown'],
  ];
  for (const [name, email, address] of normalUsers) {
    await pool.query(
      `INSERT INTO users (name, email, password, address, role)
       VALUES ($1, $2, $3, $4, 'user')
       ON CONFLICT (email) DO NOTHING`,
      [name, email, hash('User@1234'), address],
    );
  }

  const owners = [
    ['Theodore Maximilian Greene', 'owner.greene@example.com', '200 Commerce Blvd, Metro City'],
    ['Isabella Margaret Fontaine', 'owner.fontaine@example.com', '410 Market Square, Old Town'],
  ];
  const ownerIds: number[] = [];
  for (const [name, email, address] of owners) {
    const res = await pool.query(
      `INSERT INTO users (name, email, password, address, role)
       VALUES ($1, $2, $3, $4, 'owner')
       ON CONFLICT (email) DO UPDATE SET role = 'owner'
       RETURNING id`,
      [name, email, hash('Owner@1234'), address],
    );
    ownerIds.push(res.rows[0].id);
  }

  const stores = [
    ['Greene Grocery and Daily Goods', 'contact@greene-grocery.com', '200 Commerce Blvd, Metro City', ownerIds[0]],
    ['Fontaine Fashion and Apparel House', 'hello@fontaine-fashion.com', '410 Market Square, Old Town', ownerIds[1]],
    ['Springfield Electronics Superstore', 'support@springfield-elec.com', '77 Tech Park, Springfield', null],
  ];
  const storeIds: number[] = [];
  for (const [name, email, address, ownerId] of stores) {
    const res = await pool.query(
      `INSERT INTO stores (name, email, address, owner_id)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      [name, email, address, ownerId],
    );
    storeIds.push(res.rows[0].id);
  }

  const userRows = await pool.query(
    `SELECT id FROM users WHERE role = 'user' ORDER BY id`,
  );
  const userIds: number[] = userRows.rows.map((r) => r.id);
  const sampleRatings = [
    [userIds[0], storeIds[0], 4],
    [userIds[1], storeIds[0], 5],
    [userIds[2], storeIds[0], 3],
    [userIds[0], storeIds[1], 5],
    [userIds[1], storeIds[2], 2],
  ];
  for (const [userId, storeId, rating] of sampleRatings) {
    if (userId == null || storeId == null) continue;
    await pool.query(
      `INSERT INTO ratings (user_id, store_id, rating)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, store_id) DO UPDATE SET rating = EXCLUDED.rating, updated_at = now()`,
      [userId, storeId, rating],
    );
  }

  console.log('Seed complete.');

  console.log(`Admin login: ${env.seedAdmin.email} / ${env.seedAdmin.password}`);
  console.log('Normal user: john.normal@example.com / User@1234');
  console.log('Store owner: owner.greene@example.com / Owner@1234');
  await pool.end();
}

seed().catch((err) => {

  console.error('Seed failed:', err);
  process.exit(1);
});
