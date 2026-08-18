import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("Cloudflare Workers がアプリをサーバーレンダリングする", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /ALGO VAULT/);
  assert.match(html, /Cloudflare D1/);
});

test("Cloudflare D1 が唯一のアプリデータストアとして構成されている", async () => {
  const [page, styles, route, schema, wrangler, migration, stateMigration] = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("app/globals.css", root), "utf8"),
    readFile(new URL("app/api/algorithms/route.ts", root), "utf8"),
    readFile(new URL("db/schema.ts", root), "utf8"),
    readFile(new URL("wrangler.jsonc", root), "utf8"),
    readFile(new URL("drizzle/0000_tan_hydra.sql", root), "utf8"),
    readFile(new URL("drizzle/0001_wild_jack_murdock.sql", root), "utf8"),
  ]);

  assert.doesNotMatch(page, /localStorage|sessionStorage/);
  assert.match(page, /fetch\("\/api\/algorithms"/);
  assert.match(route, /getDb\(\)/);
  assert.match(route, /db\.insert\(algorithms\)/);
  assert.match(route, /export async function DELETE/);
  assert.match(route, /delete\(algorithms\)/);
  assert.match(page, /method: "DELETE"/);
  assert.match(page, /react-simple-code-editor/);
  assert.match(page, /prism-csharp/);
  assert.match(page, /label: "C#"/);
  assert.match(styles, /\.token\.keyword/);
  assert.match(schema, /sqliteTable\("algorithms"/);
  assert.match(wrangler, /"binding": "DB"/);
  assert.match(wrangler, /"database_name": "algo-vault-db"/);
  assert.match(migration, /CREATE TABLE `algorithms`/);
  assert.match(stateMigration, /CREATE TABLE `app_state`/);
  assert.match(stateMigration, /starter_data_initialized/);
});
