import { Pool, PoolClient } from "pg";
import { NextRequest, NextResponse } from "next/server";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

interface RequestBody {
  project_id: string;
  campaign_id: string;
}

interface Campaign {
  id: number;
  app_id: string;
  project_id: number;
  created_at: Date;
  updated_at: Date;
}

export const POST = async (request: NextRequest): Promise<NextResponse> => {
  const client: PoolClient = await pool.connect();
  let response: NextResponse;

  try {
    const { project_id, campaign_id }: RequestBody = await request.json();
    let queryText: string = `SELECT * FROM campaigns WHERE app_id = $1 AND project_id = $2;`;
    let { rows }: { rows: Campaign[] } = await client.query<Campaign>(
      queryText,
      [campaign_id, project_id],
    );

    if (rows.length === 0) {
      queryText = `INSERT INTO campaigns (app_id, project_id) VALUES ($1, $2) RETURNING *;`;
      const result = await client.query<Campaign>(queryText, [
        campaign_id,
        project_id,
      ]);
      rows = result.rows;
    }

    response = NextResponse.json({ campaign: rows[0] }, { status: 200 });
  } catch (error: any) {
    console.error("Error setting points:", error);
    response = NextResponse.json(
      { error: "Failed to find or create campaign" },
      { status: 500 },
    );
  } finally {
    client.release();
  }

  return response;
};
