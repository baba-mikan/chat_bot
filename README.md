# 🍊 mikan for School サポートチャットボット

mikan for School（教育機関向け英語学習サービス）のサポートチャットボット。
Notionに蓄積されたマニュアル・FAQ・活用事例をナレッジベースとして、導入済み学校の先生方からの質問に回答するRAGベースのチャットボットです。

## 機能

- 💬 リアルタイムチャット形式のQ&A
- 🔍 RAG（Retrieval-Augmented Generation）による高精度な回答
- 📚 Notionナレッジベースとの自動連携
- 🎯 サンプル質問で簡単スタート
- 📖 参照元ドキュメントの明示

## 想定質問カテゴリ

- 管理画面の操作方法（生徒管理、データ確認など）
- 生徒への指導方法（学習習慣、モチベーション維持など）
- 学習データの活用（進捗レポート、成績分析など）
- トラブルシューティング（ログイン問題、動作不良など）
- 活用事例・ベストプラクティス

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.example`をコピーして`.env`を作成し、必要なAPIキーを設定してください。

```bash
cp .env.example .env
```

必要なAPIキー：
- `ANTHROPIC_API_KEY`: Claude API key
- `NOTION_API_KEY`: Notion Integration Token
- `NOTION_DATABASE_ID`: マニュアルが格納されているNotionデータベースID
- `OPENAI_API_KEY`: OpenAI API key（Embeddings用）

### 3. Notionドキュメントのインデックス化

```bash
npm run index
```

### 4. サーバーの起動

```bash
npm start
```

開発モード（ホットリロード）：
```bash
npm run dev
```

### 5. ブラウザでアクセス

```
http://localhost:3000
```

## 技術スタック

- **フロントエンド**: HTML/CSS/JavaScript
- **バックエンド**: Node.js + Express
- **LLM**: Claude API (claude-sonnet-4-20250514)
- **Embeddings**: OpenAI text-embedding-3-small
- **Vector Store**: In-memory（シンプルなコサイン類似度検索）
- **データソース**: Notion API

## プロジェクト構造

```
chat_bot/
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── notion.js         # Notion API連携
│   │   │   ├── embedding.js      # Embedding生成
│   │   │   ├── vectorStore.js    # ベクトル検索
│   │   │   └── claude.js         # Claude API連携
│   │   ├── routes/
│   │   │   └── chat.js           # チャットAPIエンドポイント
│   │   ├── scripts/
│   │   │   └── indexDocuments.js # インデックス作成スクリプト
│   │   └── server.js             # Expressサーバー
│   └── package.json
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── .env.example
└── README.md
```

## デプロイ

Vercel または Cloudflare Workers を想定しています。

## ライセンス

MIT
