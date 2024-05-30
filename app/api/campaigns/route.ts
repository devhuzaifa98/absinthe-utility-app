import { Pool, PoolClient } from 'pg'
import { NextResponse } from 'next/server';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export const POST = async (request: Request) =>  {
  const client: PoolClient = await pool.connect();
  const { campaign_id } = await request.json()

  
}