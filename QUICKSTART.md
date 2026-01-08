# クイックスタートガイド

このガイドでは、mikan for School サポートチャットボットを最短で起動する手順を説明します。

## 📋 必要なもの

1. **Anthropic Claude API Key**
   - https://console.anthropic.com/ で取得
   - Claude Sonnet 4にアクセス可能なAPIキー

2. **OpenAI API Key**
   - https://platform.openai.com/ で取得
   - Embeddings API（text-embedding-3-small）用

3. **Notion API Key**（オプション）
   - https://www.notion.so/my-integrations で作成
   - 設定しない場合はモックデータで動作します

## 🚀 5ステップでスタート

### ステップ1: 環境変数の設定

```bash
# .env.exampleをコピー
cp .env.example .env
```

`.env`ファイルを編集して、以下のAPIキーを設定してください：

```env
# 必須
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
OPENAI_API_KEY=sk-xxxxxxxxxxxxx

# オプション（Notionを使わない場合は空でOK）
NOTION_API_KEY=
NOTION_DATABASE_ID=

# サーバー設定（デフォルトでOK）
PORT=3000
NODE_ENV=development
```

### ステップ2: 依存関係のインストール

```bash
npm install
```

### ステップ3: ドキュメントのインデックス化

```bash
npm run index
```

**重要**:
- Notion APIキーを設定していない場合、自動的に5つのモックドキュメントが使用されます
- 初回実行時は数十秒〜1分程度かかります（Embeddings生成のため）

実行すると以下のような出力が表示されます：

```
🚀 Starting document indexing...
⚠️  Notion API keys not found. Using mock documents...
✓ Loaded 5 mock documents

🔄 Generating embeddings...
Processing: 生徒の追加・削除方法
  ✓ Generated 2 chunks
...

✅ Successfully indexed 5 documents
📊 Total chunks: 12

💾 Saving vector store...
✓ Vector store saved successfully

🎉 Indexing completed!
```

### ステップ4: サーバーの起動

```bash
npm start
```

または、開発モード（ホットリロード付き）：

```bash
npm run dev
```

以下のような出力が表示されれば成功です：

```
🚀 Starting server...
📚 Loading vector store...
✓ Loaded 12 vectors

✅ Server is running on http://localhost:3000
📱 Open your browser and visit: http://localhost:3000
```

### ステップ5: ブラウザでアクセス

ブラウザで以下のURLを開きます：

```
http://localhost:3000
```

チャット画面が表示されたら成功です！🎉

## 💬 試してみよう

画面上部のサンプル質問ボタンをクリックするか、以下のような質問を入力してみてください：

- 「生徒を追加するにはどうすればいいですか？」
- 「ログインできない生徒への対処法は？」
- 「学習データの確認方法を教えてください」
- 「効果的な朝学習の運用方法は？」

## 🔧 トラブルシューティング

### ベクトルストアが空の場合

```
⚠️  Warning: Vector store is empty!
Please run "npm run index" to index documents first.
```

→ `npm run index` を実行してください

### APIキーエラーが出る場合

```
Error: Missing required API key
```

→ `.env` ファイルに正しいAPIキーが設定されているか確認してください

### ポートが使用中の場合

```
Error: Port 3000 is already in use
```

→ `.env` ファイルで `PORT=3001` など別のポート番号を指定してください

## 📚 Notionデータベースとの連携

### Notion Integration の作成

1. https://www.notion.so/my-integrations にアクセス
2. 「新しいインテグレーション」を作成
3. 「Internal Integration Token」をコピー
4. `.env` の `NOTION_API_KEY` に貼り付け

### データベースの準備

1. Notionでナレッジベース用のデータベースを作成
2. 以下のプロパティを設定：
   - タイトル（デフォルトで存在）
   - その他必要な情報
3. データベースIDをコピー（URLの一部）
4. `.env` の `NOTION_DATABASE_ID` に貼り付け
5. データベースにインテグレーションをコネクト

### 再インデックス

Notionのコンテンツを更新したら、再度インデックスを実行：

```bash
npm run index
```

## 🎯 次のステップ

- Notionにマニュアル・FAQを追加
- 回答品質を確認・調整
- デプロイ（Vercel / Cloudflare Workers）

詳細は `README.md` をご覧ください。
