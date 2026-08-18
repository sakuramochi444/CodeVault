# Algo Vault

Cloudflare Workers 上で動作し、アルゴリズムデータを Cloudflare D1 に保存する
vinext アプリです。

## 構成

- アプリ実行: Cloudflare Workers + vinext
- 静的アセット: Cloudflare Workers Static Assets
- データベース: Cloudflare D1
- ORM / マイグレーション: Drizzle ORM / Drizzle Kit
- Cloudflare 設定: `wrangler.jsonc`

## ローカル開発

Node.js 22.13 以降を用意し、次を実行します。

```bash
npm install
npm run typegen
npm run db:migrate:local
npm run dev
```

ローカル D1 のデータは `.wrangler/` 以下に保持されます。最初の API アクセス時、
テーブルが空ならサンプルのアルゴリズムが D1 に登録されます。ブラウザの
`localStorage` は使用しません。

## Cloudflare へのデプロイ

初回のみ Wrangler で Cloudflare にログインします。

```bash
npx wrangler login
npx wrangler d1 create algo-vault-db
```

`d1 create` が返す `database_id` を `wrangler.jsonc` の `DB` 設定へ追加し、
次を実行します。

```bash
npm run db:migrate:remote
npm run deploy
```

CI ではブラウザログインの代わりに `CLOUDFLARE_API_TOKEN` と
`CLOUDFLARE_ACCOUNT_ID` をシークレットとして設定してください。

## コマンド

- `npm run dev`: Cloudflare Workers ランタイムでローカル開発
- `npm run build`: 本番ビルド
- `npm run deploy`: Cloudflare Workers へビルド・デプロイ
- `npm run typegen`: `wrangler.jsonc` からバインディング型を生成
- `npm run db:generate`: スキーマ変更から D1 マイグレーションを生成
- `npm run db:migrate:local`: ローカル D1 にマイグレーションを適用
- `npm run db:migrate:remote`: Cloudflare D1 にマイグレーションを適用
- `npm run lint`: ESLint
- `npm test`: ビルドと構成テスト

## 参考資料

- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [vinext](https://github.com/cloudflare/vinext)
