import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

dotenv.config();

const notion = new Client({ auth: process.env.NOTION_API_KEY });

/**
 * Notionデータベースから全ドキュメントを取得
 * @returns {Promise<Array>} ドキュメントの配列
 */
export async function getAllDocuments() {
  const databaseId = process.env.NOTION_DATABASE_ID;

  if (!databaseId) {
    throw new Error('NOTION_DATABASE_ID is not set');
  }

  try {
    const response = await notion.databases.query({
      database_id: databaseId,
    });

    const documents = await Promise.all(
      response.results.map(async (page) => {
        const content = await getPageContent(page.id);
        const title = extractTitle(page);

        return {
          id: page.id,
          title,
          content,
          url: page.url,
          lastEdited: page.last_edited_time,
        };
      })
    );

    return documents;
  } catch (error) {
    console.error('Error fetching Notion documents:', error);
    throw error;
  }
}

/**
 * ページのタイトルを抽出
 * @param {Object} page - Notionページオブジェクト
 * @returns {string} タイトル
 */
function extractTitle(page) {
  // タイトルプロパティを探す
  const titleProperty = Object.values(page.properties).find(
    (prop) => prop.type === 'title'
  );

  if (titleProperty && titleProperty.title && titleProperty.title.length > 0) {
    return titleProperty.title.map((t) => t.plain_text).join('');
  }

  return 'Untitled';
}

/**
 * ページのコンテンツを取得して平文に変換
 * @param {string} pageId - ページID
 * @returns {Promise<string>} ページのテキストコンテンツ
 */
async function getPageContent(pageId) {
  try {
    const blocks = await getAllBlocks(pageId);
    const text = blocks.map((block) => extractTextFromBlock(block)).join('\n');
    return text;
  } catch (error) {
    console.error(`Error fetching page content for ${pageId}:`, error);
    return '';
  }
}

/**
 * ページの全ブロックを取得（ページネーション対応）
 * @param {string} blockId - ブロックID
 * @returns {Promise<Array>} ブロックの配列
 */
async function getAllBlocks(blockId) {
  let blocks = [];
  let hasMore = true;
  let startCursor = undefined;

  while (hasMore) {
    const response = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: startCursor,
    });

    blocks = blocks.concat(response.results);
    hasMore = response.has_more;
    startCursor = response.next_cursor;
  }

  return blocks;
}

/**
 * ブロックからテキストを抽出
 * @param {Object} block - Notionブロック
 * @returns {string} 抽出されたテキスト
 */
function extractTextFromBlock(block) {
  const type = block.type;

  // テキストを含む可能性のあるブロックタイプ
  const textContainingTypes = [
    'paragraph',
    'heading_1',
    'heading_2',
    'heading_3',
    'bulleted_list_item',
    'numbered_list_item',
    'to_do',
    'toggle',
    'quote',
    'callout',
  ];

  if (textContainingTypes.includes(type) && block[type].rich_text) {
    return block[type].rich_text.map((text) => text.plain_text).join('');
  }

  // コードブロック
  if (type === 'code' && block.code.rich_text) {
    return block.code.rich_text.map((text) => text.plain_text).join('');
  }

  return '';
}

/**
 * モックデータを返す（Notion APIが未設定の場合のフォールバック）
 * @returns {Array} モックドキュメント
 */
export function getMockDocuments() {
  return [
    {
      id: 'mock-1',
      title: '生徒の追加・削除方法',
      content: `
# 生徒の追加・削除方法

## 生徒を追加する

1. 管理画面にログインします
2. 左メニューから「生徒管理」を選択
3. 「新規生徒追加」ボタンをクリック
4. 以下の情報を入力します：
   - 生徒名
   - メールアドレス（任意）
   - 学年
   - クラス
5. 「追加」ボタンをクリックして完了

生徒には自動的にログインIDとパスワードが発行されます。

## 生徒を削除する

1. 管理画面の「生徒管理」から対象の生徒を検索
2. 生徒名をクリックして詳細画面を開く
3. 「削除」ボタンをクリック
4. 確認ダイアログで「はい」を選択

注意：削除すると学習データも完全に削除されます。
      `,
      url: 'https://notion.so/mock-1',
      lastEdited: new Date().toISOString(),
    },
    {
      id: 'mock-2',
      title: 'ログインできない場合の対処法',
      content: `
# ログインできない場合の対処法

## よくある原因と解決方法

### 1. IDまたはパスワードが間違っている

- IDとパスワードは大文字小文字を区別します
- スペースが入っていないか確認してください
- コピー＆ペーストする場合は余分なスペースに注意

### 2. アカウントが有効化されていない

管理画面で生徒アカウントの状態を確認してください。
「無効」になっている場合は、「有効化」ボタンをクリックします。

### 3. パスワードをリセットする

1. 管理画面の「生徒管理」から対象生徒を検索
2. 「パスワードリセット」をクリック
3. 新しいパスワードが自動生成されます
4. 生徒に新しいパスワードを共有してください

### 4. アプリの再インストール

上記で解決しない場合、アプリを一度アンインストールして
再度インストールすることで改善する場合があります。
      `,
      url: 'https://notion.so/mock-2',
      lastEdited: new Date().toISOString(),
    },
    {
      id: 'mock-3',
      title: '学習データの確認方法',
      content: `
# 学習データの確認方法

## 個別の生徒データを確認する

1. 管理画面の「生徒管理」から生徒を検索
2. 生徒名をクリックして詳細ページを開く
3. 以下のデータを確認できます：
   - 学習時間（今週・今月・累計）
   - 学習した単語数
   - 正答率
   - 連続学習日数
   - ランキング

## クラス全体のデータを確認する

1. 左メニューから「レポート」を選択
2. 対象のクラスを選択
3. 期間を指定（今週・今月・カスタム期間）
4. CSVダウンロードも可能です

## 活用のポイント

- 学習時間が少ない生徒には声かけを
- 正答率が低い場合は学習方法をアドバイス
- 連続学習日数を褒めてモチベーションアップ
      `,
      url: 'https://notion.so/mock-3',
      lastEdited: new Date().toISOString(),
    },
    {
      id: 'mock-4',
      title: '効果的な学習習慣の作り方',
      content: `
# 効果的な学習習慣の作り方

## 朝学習での活用

### おすすめの運用方法

1. **毎朝10分間をmikan時間に**
   - HR前の10分を活用
   - クラス全体で取り組むことで習慣化

2. **目標設定**
   - 1日10単語など具体的な目標を設定
   - 達成したらシールやスタンプで可視化

3. **ランキング機能の活用**
   - 週ごとのクラスランキングを掲示
   - 競争心を刺激してモチベーション維持

## 授業内での活用

- 単語テストの前に5分間の復習時間
- 定期テスト前の集中学習期間の設定
- グループで目標達成を目指す

## 継続のコツ

- 小さな成功体験を積み重ねる
- 先生自身も一緒に取り組む姿勢を見せる
- 定期的に成果を振り返る機会を作る
      `,
      url: 'https://notion.so/mock-4',
      lastEdited: new Date().toISOString(),
    },
    {
      id: 'mock-5',
      title: '成功事例：A高校の取り組み',
      content: `
# 成功事例：A高校の取り組み

## 学校概要

- 生徒数：約600名
- 導入時期：2023年4月
- 対象：全学年

## 取り組み内容

### 1. 朝学習での全校一斉実施

毎朝8:30-8:40の10分間をmikan timeとして設定。
全生徒がスマホを取り出して学習する時間を確保。

### 2. 学年別ランキング制度

- 月間学習単語数ランキングを廊下に掲示
- 上位者には校長から表彰状
- クラス平均もランキング化して競争意識を醸成

### 3. 英検対策コースの活用

英検2ヶ月前から該当級のコースを全員に割り当て。
級別の対策講座と連動させて効果を最大化。

## 成果

- 平均学習単語数：月間2,500単語
- 英検合格率：前年比120%
- 生徒アンケート満足度：92%

## 先生のコメント

「最初は習慣化に苦労しましたが、3週間続けると
自然とスマホを取り出すようになりました。
ランキングは予想以上に効果的でした。」
      `,
      url: 'https://notion.so/mock-5',
      lastEdited: new Date().toISOString(),
    },
  ];
}
