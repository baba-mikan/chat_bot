# Notion連携セットアップガイド

このガイドでは、mikan for School サポートチャットボットをNotionのナレッジベースと連携させる方法を説明します。

## 📋 前提条件

- Notionアカウント
- Notionでナレッジベース用のデータベースを作成済み、または作成できる

## 🔧 セットアップ手順

### ステップ1: Notion Integrationの作成

1. **Notion Integrations ページにアクセス**
   ```
   https://www.notion.so/my-integrations
   ```

2. **新しいIntegrationを作成**
   - 「+ New integration」ボタンをクリック
   - 以下の情報を入力：
     - **Name**: `mikan-support-bot`（任意の名前）
     - **Associated workspace**: ナレッジベースがあるワークスペースを選択
     - **Type**: Internal
   - 「Submit」をクリック

3. **Integration Tokenをコピー**
   - 作成後に表示される「Internal Integration Token」をコピー
   - `secret_` で始まる文字列です
   - **重要**: このトークンは安全に保管してください

### ステップ2: Notionデータベースの作成

1. **新しいデータベースページを作成**

   Notionで新しいページを作成し、データベースビューを選択します。

2. **推奨されるデータベース構造**

   ```
   データベース名: mikan for School サポートドキュメント

   プロパティ:
   - タイトル（Title） - デフォルトで存在
   - カテゴリ（Select） - オプション
     選択肢例:
     - 管理画面操作
     - 生徒指導方法
     - トラブルシューティング
     - 活用事例
     - FAQ
   ```

3. **サンプルページを追加**

   以下のようなページを作成してください：

   **ページ1: 生徒の追加方法**
   ```
   カテゴリ: 管理画面操作

   # 生徒の追加方法

   生徒を追加する手順を説明します。

   ## 手順

   1. 管理画面にログイン
   2. 左メニューから「生徒管理」を選択
   3. 「新規生徒追加」ボタンをクリック
   4. 以下の情報を入力：
      - 生徒名
      - メールアドレス（任意）
      - 学年
      - クラス
   5. 「追加」ボタンをクリック

   生徒には自動的にログインIDとパスワードが発行されます。
   ```

   **ページ2: ログイントラブル対応**
   ```
   カテゴリ: トラブルシューティング

   # ログインできない場合の対処法

   ## よくある原因

   1. IDまたはパスワードの入力ミス
      - 大文字小文字を正確に入力してください
      - 余分なスペースに注意してください

   2. アカウントが無効化されている
      - 管理画面でアカウント状態を確認してください

   3. パスワードを忘れた
      - パスワードリセット機能を利用してください

   ## 解決方法

   ### パスワードリセット手順
   1. 管理画面の「生徒管理」から対象生徒を検索
   2. 「パスワードリセット」をクリック
   3. 新しいパスワードが自動生成されます
   4. 生徒に新しいパスワードを共有してください
   ```

   **ページ3: 学習データの確認方法**
   ```
   カテゴリ: 管理画面操作

   # 学習データの確認方法

   ## 個別の生徒データを確認

   1. 管理画面の「生徒管理」から生徒を検索
   2. 生徒名をクリックして詳細ページを開く
   3. 以下のデータを確認できます：
      - 学習時間（今週・今月・累計）
      - 学習した単語数
      - 正答率
      - 連続学習日数
      - ランキング

   ## クラス全体のデータを確認

   1. 左メニューから「レポート」を選択
   2. 対象のクラスを選択
   3. 期間を指定（今週・今月・カスタム期間）
   4. CSVダウンロードも可能です

   ## 活用のポイント

   - 学習時間が少ない生徒には声かけを
   - 正答率が低い場合は学習方法をアドバイス
   - 連続学習日数を褒めてモチベーションアップ
   ```

### ステップ3: IntegrationをデータベースにConnect

1. **データベースページを開く**
2. **右上の「...」（3点メニュー）をクリック**
3. **「Add connections」を選択**
4. **作成した Integration（例: mikan-support-bot）を選択**

これで、Integrationがデータベースのコンテンツにアクセスできるようになります。

### ステップ4: Database IDの取得

1. **データベースページのURLをコピー**

   URLの形式:
   ```
   https://www.notion.so/workspace名/DATABASE_ID?v=view_id
   ```

2. **Database IDを抽出**

   例:
   ```
   https://www.notion.so/myworkspace/e396f3003052423881a2c41eb38635ea?v=abc123
   ```

   この場合、Database IDは **`e396f3003052423881a2c41eb38635ea`** です。
   （`?v=` の前の32文字の英数字）

### ステップ5: 環境変数の設定

1. **プロジェクトディレクトリで`.env`ファイルを作成**

   ```bash
   cp .env.example .env
   ```

2. **`.env`ファイルを編集**

   ```env
   # Anthropic Claude API
   ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxx

   # Notion API
   NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

   # OpenAI API
   OPENAI_API_KEY=sk-proj-xxxxxxxxxx

   # Server Configuration
   PORT=3000
   NODE_ENV=development
   ```

   - `NOTION_API_KEY`: ステップ1で取得したIntegration Token（`secret_`で始まる）
   - `NOTION_DATABASE_ID`: ステップ4で取得したDatabase ID（32文字の英数字）

### ステップ6: Notionドキュメントのインデックス化

```bash
npm run index
```

このコマンドは：
- Notionデータベースから全ページを取得
- 各ページの内容を解析
- ベクトル埋め込みを生成（OpenAI API使用）
- ベクトルストアに保存

**実行例:**
```
🚀 Starting document indexing...

📚 Fetching documents from Notion...
✓ Fetched 10 documents from Notion

🔄 Generating embeddings...

Processing: 生徒の追加方法
  ✓ Generated 2 chunks
Processing: ログインできない場合の対処法
  ✓ Generated 3 chunks
...

✅ Successfully indexed 10 documents
📊 Total chunks: 25

💾 Saving vector store...
✓ Vector store saved successfully

🎉 Indexing completed!
```

### ステップ7: サーバーの起動

```bash
npm start
```

ブラウザで `http://localhost:3000` にアクセスして動作確認してください。

## 🔄 ドキュメントの更新

Notionでドキュメントを追加・更新した場合は、再度インデックス化を実行してください：

```bash
npm run index
```

サーバーを再起動すると、新しいインデックスが読み込まれます。

## ⚠️ トラブルシューティング

### Notion APIエラー

**エラー**: `Error fetching Notion documents: Unauthorized`

**原因**: Integration TokenまたはDatabase IDが正しくない、またはIntegrationがデータベースに接続されていない

**解決方法**:
1. Integration Tokenが正しいか確認
2. Database IDが正しいか確認
3. データベースページでIntegrationが接続されているか確認

### インデックス化エラー

**エラー**: `No documents found`

**原因**: データベースが空、またはIntegrationに権限がない

**解決方法**:
1. データベースにページが追加されているか確認
2. IntegrationがデータベースにConnect されているか確認

## 📝 ベストプラクティス

### ドキュメント作成のコツ

1. **明確なタイトル**
   - 質問形式または簡潔な説明を使用
   - 例: 「生徒の追加方法」「ログインできない時の対処法」

2. **構造化されたコンテンツ**
   - 見出し（H1, H2, H3）を使用
   - 箇条書きや番号付きリストを活用
   - 手順は番号付きで明確に

3. **具体的な情報**
   - スクリーンショットを含める（可能な場合）
   - 具体的な例を示す
   - よくある間違いや注意点を記載

4. **カテゴリ分け**
   - Select プロパティでカテゴリを設定
   - 関連するドキュメントをグループ化

### インデックス化のタイミング

- **毎日**: 頻繁に更新する場合
- **週1回**: 定期的なメンテナンス
- **更新時**: 重要な変更があった時

## 🎯 次のステップ

1. 実際のマニュアル・FAQをNotionに追加
2. 定期的にインデックスを更新
3. ユーザーからのフィードバックを基にドキュメントを改善
4. 本番環境へのデプロイ（Vercel / Cloudflare Workers）

---

質問や問題がある場合は、プロジェクトのREADME.mdまたはissuesを参照してください。
