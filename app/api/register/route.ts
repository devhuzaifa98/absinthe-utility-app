import { Pool, PoolClient } from 'pg';
import { randomBytes, createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const POST = async (request: NextRequest) => {
  const client: PoolClient = await pool.connect();
  let name: string | undefined;

  request.json().then((data) => {
    name = data.name
  });

  const combinedString = [
    Date.now(),
    randomBytes(16).toString('hex'),
  ].join('');

  const apiKey = createHash('sha256').update(combinedString).digest('hex');

  let response;
  try {
    let queryText = `INSERT INTO projects (api_key) VALUES ($1) RETURNING *;`;
    let queryValues = [apiKey];

    if (name) {
      queryText = `INSERT INTO projects (api_key, name) VALUES ($1, $2) RETURNING *;`;
      queryValues = [apiKey, name]; 
    }

    const { rows } = await client.query(queryText, queryValues);
    response = NextResponse.json({
      api_key: rows[0].api_key,
    }, { status: 200 });
  } catch (error) {
    console.error('Error generating API key:', error);
    response = NextResponse.json({ error: 'Failed to generate API key' }, { status: 500 });
  } finally {
    client.release();
  }

  return response;
};
