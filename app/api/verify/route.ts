import { Pool, PoolClient } from "pg";
import { NextResponse } from "next/server";

const pool: Pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

interface Project {
  id: number,
  name?: string,
  api_key: string;
  created_at: Date,
  updated_at: Date
}

export const GET = async (request: Request): Promise<NextResponse> => {
  const client: PoolClient = await pool.connect();

  const apiKey: string | null = request.headers.get("Api-Key");

  if (!apiKey) {
    return NextResponse.json(
      { error: "API key is missing" },
      { status: 401 },
    );
  }

  try {
    const { rows }: { rows: Project[] } = await client.query(
      "SELECT * FROM projects WHERE api_key = $1",
      [apiKey],
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401 },
      );
    }

    return NextResponse.json({ project: rows[0] }, { status: 200 });
  } catch (error) {
    console.error("Error verifying API key:", error);
    return NextResponse.json(
      { error: "Failed to verify API key" },
      { status: 500 },
    );
  } finally {
    client.release();
  }
};
