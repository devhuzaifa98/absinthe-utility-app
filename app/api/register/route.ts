
import { Pool, PoolClient } from 'pg'
import { randomBytes, createHash } from 'crypto';
import { NextResponse } from 'next/server';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export const POST = async (request: Request) =>  {
  const client: PoolClient = await pool.connect();
  const { name } = await request.json()

  const combinedString = [
    Date.now(),
    randomBytes(16).toString('hex')
  ].join('')

  const apiKey = createHash('sha256').update(combinedString).digest('hex');

  try {
    let queryText = `INSERT INTO projects (api_key) VALUES ($1) RETURNING *;`;
    let queryValues = [apiKey]

    if (name) {
      queryText = `INSERT INTO projects (api_key, name) VALUES ($1, $2) RETURNING *;`;
      queryValues.push(name)
    }

    const { rows } = await client.query(queryText, queryValues);
    return NextResponse.json({
      api_key: apiKey
    }, { status: 200})
  } catch (error) {
    console.error('Error setting points:', error);
    return NextResponse.json({ error: 'Failed to generate api key' }, { status: 500})
  } finally {
    client.release();
  }

  return NextResponse.json({
    api_key: apiKey
  }, { status: 200})
}
