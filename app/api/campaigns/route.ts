import { Pool, PoolClient } from 'pg';
import { NextResponse } from 'next/server';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const POST = async (request: Request) => {
  const client: PoolClient = await pool.connect();
  const { project_id, campaign_id } = await request.json();

  try {
    let queryText = `SELECT * FROM campaigns WHERE app_id = $1 AND project_id = $2;`;
    let { rows } = await client.query(queryText, [campaign_id, project_id]);

    if (rows.length === 0) {
      queryText = `INSERT INTO campaigns (app_id, project_id) VALUES ($1, $2) RETURNING *;`;
      const result = await client.query(queryText, [campaign_id, project_id]);
      rows = result.rows;
    }

    return NextResponse.json({
      campaign: rows[0],
    }, { status: 200 });
  } catch (error) {
    console.error('Error setting points:', error);
    return NextResponse.json({ error: 'Failed to find or create campaign' }, { status: 500 });
  } finally {
    client.release();
  }
};
