import { Pool, PoolClient } from 'pg'
import { NextResponse } from 'next/server';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export const GET = async (request: Request) => {
  const client: PoolClient = await pool.connect();

  const apiKey = request.headers.get('Api-Key')

  const { rows } = await client.query('SELECT * FROM projects WHERE api_key = $1', [apiKey]);

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Invalid authorization token' }, { status: 401 });
  }

  return NextResponse.json({ project: rows[0]}, { status: 200 });
}