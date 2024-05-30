import { Pool, PoolClient } from "pg";
import { randomBytes, createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

interface RequestBody {
  name?: string;
}

interface Project {
  api_key: string;
}

export const POST = async (request: NextRequest): Promise<NextResponse> => {
  const client: PoolClient = await pool.connect();
  let name: string | undefined;

  // Parse request body
  let requestBody: RequestBody;
  try {
    requestBody = await request.json();
    name = requestBody.name;
  } catch (error: any) {
    console.error("Error parsing request body:", error);
    return NextResponse.json(
      { error: "Failed to parse request body" },
      { status: 400 },
    );
  }

  // Generate API key
  const combinedString = [Date.now(), randomBytes(16).toString("hex")].join("");

  const apiKey = createHash("sha256").update(combinedString).digest("hex");

  let response: NextResponse;

  try {
    let queryText: string = `INSERT INTO projects (api_key) VALUES ($1) RETURNING *;`;
    let queryValues = [apiKey];

    if (name) {
      queryText = `INSERT INTO projects (api_key, name) VALUES ($1, $2) RETURNING *;`;
      queryValues = [apiKey, name];
    }

    const { rows }: { rows: Project[] } = await client.query<Project>(
      queryText,
      queryValues,
    );

    response = NextResponse.json(
      {
        api_key: rows[0].api_key,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error generating API key:", error);
    response = NextResponse.json(
      { error: "Failed to generate API key" },
      { status: 500 },
    );
  } finally {
    client.release();
  }

  return response;
};
