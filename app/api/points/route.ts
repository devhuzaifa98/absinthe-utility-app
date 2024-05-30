import { Pool, PoolClient } from 'pg';
import { NextRequest, NextResponse } from 'next/server';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const POST = async (request: NextRequest) => {
  const client: PoolClient = await pool.connect();

  const body = await request.json()

  let response;
  try {
    let queryText = `INSERT INTO points (points, address, campaign_id) VALUES ($1, $2, $3) RETURNING *;`;
    let queryValues = [body.points, body.address, body.campaignId];

    if (body.eventName) {
      queryText = `INSERT INTO points (event_name, points, address, campaign_id) VALUES ($1, $2, $3, $4) RETURNING *;`;
      queryValues = [body.eventName, body.points, body.address, body.campaignId];
    }

    const { rows } = await client.query(queryText, queryValues);
    response = NextResponse.json({
      point: rows[0]
    }, { status: 200 });
  } catch (error) {
    console.error('Error generating Point:', error);
    response = NextResponse.json({ error: 'Failed to generate Point' }, { status: 500 });
  } finally {
    client.release();
  }

  return response;
}

export const GET = async (request: NextRequest) => {
  const client: PoolClient = await pool.connect();

  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get('address');
  const eventName = searchParams.get('event_name');

  let response;
  try {
    let queryText = `SELECT * FROM points WHERE address = $1`;
    const queryValues = [address];

    if (eventName) {
      queryText += ` AND event_name = $2`;
      queryValues.push(eventName);
    }

    const { rows } = await client.query(queryText, queryValues);
    response = NextResponse.json({
      points: rows
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching points:', error);
    response = NextResponse.json({ error: 'Failed to fetch points' }, { status: 500 });
  } finally {
    client.release();
  }

  return response;
};