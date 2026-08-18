import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { starterAlgorithms } from "@/db/seed";
import { algorithms, type NewAlgorithm } from "@/db/schema";

export const dynamic = "force-dynamic";

const textFields = ["title", "category", "language", "complexity", "description", "code", "updatedAt"] as const;

function parseAlgorithm(value: unknown, requireId: boolean): (NewAlgorithm & { id?: number }) | null {
  if (!value || typeof value !== "object") return null;
  const input = value as Record<string, unknown>;
  if (requireId && (!Number.isInteger(input.id) || Number(input.id) <= 0)) return null;
  if (textFields.some((field) => typeof input[field] !== "string")) return null;
  if (!Array.isArray(input.tags) || input.tags.some((tag) => typeof tag !== "string")) return null;
  if (typeof input.favorite !== "boolean") return null;

  return {
    ...(requireId ? { id: Number(input.id) } : {}),
    title: String(input.title).trim(),
    category: String(input.category).trim(),
    language: String(input.language).trim(),
    complexity: String(input.complexity).trim(),
    description: String(input.description),
    code: String(input.code),
    tags: input.tags.map(String),
    favorite: input.favorite,
    updatedAt: String(input.updatedAt),
  };
}

export async function GET() {
  const db = getDb();
  let rows = await db.select().from(algorithms).orderBy(desc(algorithms.id));
  if (rows.length === 0) {
    await db.insert(algorithms).values(starterAlgorithms).onConflictDoNothing();
    rows = await db.select().from(algorithms).orderBy(desc(algorithms.id));
  }
  return Response.json(rows);
}

export async function POST(request: Request) {
  const input = parseAlgorithm(await request.json(), false);
  if (!input || !input.title) {
    return Response.json({ error: "入力内容が正しくありません。" }, { status: 400 });
  }
  const [created] = await getDb().insert(algorithms).values(input).returning();
  return Response.json(created, { status: 201 });
}

export async function PUT(request: Request) {
  const input = parseAlgorithm(await request.json(), true);
  if (!input?.id || !input.title) {
    return Response.json({ error: "入力内容が正しくありません。" }, { status: 400 });
  }
  const { id, ...changes } = input;
  const [updated] = await getDb().update(algorithms).set(changes).where(eq(algorithms.id, id)).returning();
  if (!updated) {
    return Response.json({ error: "対象のデータが見つかりません。" }, { status: 404 });
  }
  return Response.json(updated);
}
