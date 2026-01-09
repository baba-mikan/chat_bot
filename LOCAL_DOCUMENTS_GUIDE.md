# 📄 ローカルファイルからナレッジベースを構築する方法

NotionではなくPDFやテキストファイルから直接ナレッジベースを作成できます。

## 🚀 クイックスタート

### ステップ1: pdf-parseライブラリをインストール

```bash
npm install
```

これで `pdf-parse` が自動的にインストールされます。

### ステップ2: ドキュメントを配置

プロジェクトルートに `docs/` フォルダを作成し、PDFやテキストファイルを配置します：

```bash
# docsフォルダを作成
mkdir docs

# ファイルをコピー
cp /path/to/your/manual.pdf docs/
cp /path/to/your/faq.txt docs/
cp /path/to/your/guide.md docs/
```

### ステップ3: インデックス化

```bash
npm run index:local
```

### ステップ4: サーバー起動

```bash
npm start
```

ブラウザで `http://localhost:3000` にアクセス！

---

## 📁 対応ファイル形式

| 形式 | 拡張子 | 説明 |
|------|--------|------|
| **PDF** | `.pdf` | PDFマニュアル、資料 |
| **テキスト** | `.txt` | プレーンテキスト |
| **Markdown** | `.md` | Markdown形式のドキュメント |

---

## 📝 使用例

### 例1: PDFマニュアルを使う

```bash
# プロジェクトディレクトリで
mkdir docs

# PDFファイルをコピー
cp ~/Desktop/mikan-manual.pdf docs/
cp ~/Desktop/faq.pdf docs/

# インデックス化
npm run index:local

# 実行結果:
# 📚 Loading documents from docs/...
#   Reading PDF: mikan-manual.pdf
#   Reading PDF: faq.pdf
# ✓ Loaded 2 documents
#
# 🔄 Generating embeddings...
# Processing: mikan-manual
#   ✓ Generated 15 chunks
# Processing: faq
#   ✓ Generated 8 chunks
#
# ✅ Successfully indexed 2 documents
# 📊 Total chunks: 23
```

### 例2: テキストファイルを使う

```bash
# テキストファイルを作成
cat > docs/生徒追加方法.txt << 'EOF'
# 生徒の追加方法

管理画面から以下の手順で生徒を追加できます：

1. 左メニューから「生徒管理」を選択
2. 「新規生徒追加」ボタンをクリック
3. 必要な情報を入力
4. 「追加」ボタンをクリック

生徒には自動的にログインIDとパスワードが発行されます。
EOF

# インデックス化
npm run index:local
```

### 例3: 複数の形式を混在

```
docs/
├── manual.pdf          # PDFマニュアル
├── faq.txt             # FAQ（テキスト）
├── guide.md            # 使い方ガイド（Markdown）
├── troubleshooting.pdf # トラブルシューティング
└── tips.txt            # 活用のコツ
```

すべてのファイルが自動的に読み込まれます。

---

## 🔧 詳細設定

### チャンクサイズの調整

デフォルトでは1000文字ごとにチャンク分割されます。

変更したい場合は `backend/src/scripts/indexLocalDocuments.js` を編集：

```javascript
// 行65あたり
const chunks = await generateDocumentEmbeddings(doc, 1500, 300);
//                                                  ↑     ↑
//                                            チャンク  オーバーラップ
```

### PDFのテキスト抽出が失敗する場合

一部のPDFは画像として保存されているため、テキスト抽出ができません。

**対処法：**
1. PDFをテキストに変換してから使用
2. OCR処理を行う（別ツール）
3. 手動でテキストファイルに書き起こす

---

## 🆚 各方法の比較

| 方法 | メリット | デメリット |
|------|----------|-----------|
| **Notion連携** | ・ブラウザで編集<br>・リアルタイム更新<br>・チーム共有 | ・API設定が必要<br>・Integration接続が必要 |
| **ローカルファイル** | ・簡単（ファイルを置くだけ）<br>・既存のPDFを活用<br>・API不要 | ・更新時に再インデックス必要<br>・編集はファイルで行う |
| **モックデータ** | ・即座に動作確認<br>・設定不要 | ・サンプルデータのみ<br>・本番利用不可 |

---

## 💡 おすすめの使い方

### 開発・テスト段階
```bash
npm run index:mock      # モックデータで素早く動作確認
```

### 既存のPDFマニュアルがある場合
```bash
npm run index:local     # PDFから直接取り込み
```

### チームで継続的に更新する場合
```bash
npm run index           # Notion連携（要設定）
```

---

## 🔄 ドキュメントの更新

ドキュメントを追加・変更した場合：

```bash
# 1. docs/ フォルダにファイルを追加・更新

# 2. 再インデックス
npm run index:local

# 3. サーバー再起動（起動中の場合）
# Ctrl+C でサーバー停止
npm start
```

---

## 📊 ファイルサイズの推奨

| ファイル種類 | 推奨サイズ | 理由 |
|-------------|-----------|------|
| 単一PDF | 〜10MB | 処理速度 |
| 総ドキュメント数 | 〜50ファイル | インデックス時間 |
| 1ファイルのテキスト量 | 〜50,000文字 | チャンク分割の効率 |

大量のドキュメントがある場合は、カテゴリごとに分けて複数のベクトルストアを作成することをお勧めします。

---

## ❓ トラブルシューティング

### Q: PDFからテキストが抽出できない

**A:** 以下を確認：
- PDFがテキストベースか（画像PDFではないか）
- PDFが破損していないか
- `npm install` が正常に完了しているか

### Q: インデックス化に時間がかかる

**A:** 以下が原因の可能性：
- OpenAI APIへの接続が遅い
- ファイルサイズが大きい
- ファイル数が多い

対処法：
- ファイルを分割して少しずつインデックス化
- より強力なマシンで実行

### Q: エラー: "Cannot find module 'pdf-parse'"

**A:**
```bash
npm install pdf-parse
```

---

## 🎯 実践例：mikan for School マニュアルをPDFで取り込む

```bash
# 1. プロジェクトディレクトリに移動
cd chat_bot

# 2. docsフォルダを作成
mkdir -p docs

# 3. PDFマニュアルをコピー
cp ~/Downloads/mikan-for-school-管理者マニュアル.pdf docs/
cp ~/Downloads/mikan-for-school-FAQ.pdf docs/
cp ~/Downloads/mikan-for-school-活用事例.pdf docs/

# 4. インデックス化
npm run index:local

# 5. サーバー起動
npm start

# 6. ブラウザでテスト
open http://localhost:3000
```

これで、PDFマニュアルの内容を基にチャットボットが回答します！

---

## 📚 次のステップ

1. **ドキュメントを準備**
   - 既存のPDFマニュアルを探す
   - または、テキストファイルで新規作成

2. **インデックス化**
   - `npm run index:local`

3. **動作確認**
   - チャットボットで質問してみる
   - 回答品質を確認

4. **改善**
   - 不足している情報を追加
   - ドキュメントの内容を充実化
   - 再インデックス

---

質問や問題がある場合は、README.mdまたはissuesを参照してください。
