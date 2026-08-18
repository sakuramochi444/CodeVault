import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db";
import { starterAlgorithms } from "@/db/seed";
import { algorithms, appState, type NewAlgorithm } from "@/db/schema";

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
  const [seedState] = await db.select().from(appState).where(eq(appState.key, "starter_data_initialized")).limit(1);
  if (rows.length > 0 && seedState?.value !== "1") {
    await db.insert(appState).values({ key: "starter_data_initialized", value: "1" }).onConflictDoUpdate({
      target: appState.key,
      set: { value: "1" },
    });
  }
  if (rows.length === 0 && seedState?.value !== "1") {
    await db.insert(algorithms).values(starterAlgorithms).onConflictDoNothing();
    await db.insert(appState).values({ key: "starter_data_initialized", value: "1" }).onConflictDoUpdate({
      target: appState.key,
      set: { value: "1" },
    });
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

export async function DELETE(request: Request) {
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isInteger(id) || id <= 0) {
    return Response.json({ error: "削除対象が正しくありません。" }, { status: 400 });
  }

  const [deleted] = await getDb().delete(algorithms).where(eq(algorithms.id, id)).returning({ id: algorithms.id });
  if (!deleted) {
    return Response.json({ error: "対象のデータが見つかりません。" }, { status: 404 });
  }
  return new Response(null, { status: 204 });
}
