import { Pool, PoolClient } from "pg";
import { NextRequest, NextResponse } from "next/server";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

interface PointRequestBody {
  points: number;
  address: string;
  campaignId: string;
  eventName?: string;
}

interface Point {
  id: number,
  points: number,
  address: string,
  event_name?: string,
  campaign_id: number,
  created_at: Date,
  updated_at: Date
}

export const POST = async (request: NextRequest): Promise<NextResponse> => {
  const client: PoolClient = await pool.connect();

  const body: PointRequestBody = await request.json();

  let response: NextResponse;
  try {
    let queryText: string = `INSERT INTO points (points, address, campaign_id) VALUES ($1, $2, $3) RETURNING *;`;
    let queryValues = [body.points, body.address, body.campaignId];

    if (body.eventName) {
      queryText = `INSERT INTO points (event_name, points, address, campaign_id) VALUES ($1, $2, $3, $4) RETURNING *;`;
      queryValues = [
        body.eventName,
        body.points,
        body.address,
        body.campaignId,
      ];
    }

    const { rows }: { rows: Point[] } = await client.query(queryText, queryValues);
    response = NextResponse.json(
      {
        point: rows[0],
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error generating Point:", error);
    response = NextResponse.json(
      { error: "Failed to generate Point" },
      { status: 500 },
    );
  } finally {
    client.release();
  }

  return response;
};

export const GET = async (request: NextRequest): Promise<NextResponse> => {
  const client: PoolClient = await pool.connect();

  const searchParams = request.nextUrl.searchParams;
  const address: string | null = searchParams.get("address");
  const campaign_id: string | null = searchParams.get("campaign_id");
  const eventName: string | null = searchParams.get("event_name");

  let response: NextResponse;
  try {
    let queryText: string = `SELECT * FROM points WHERE campaign_id = $1`;
    const queryValues = [campaign_id];

    if (address) {
      queryText += ` AND address = $2`;
      queryValues.push(address);
    }

    if (eventName) {
      queryText += ` AND event_name = $3`;
      queryValues.push(eventName);
    }

    const { rows }: { rows: Point[] } = await client.query(queryText, queryValues);
    response = NextResponse.json(
      {
        points: rows,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching points:", error);
    response = NextResponse.json(
      { error: "Failed to fetch points" },
      { status: 500 },
    );
  } finally {
    client.release();
  }

  return response;
};
