import { getAllDocuments } from '../services/notion.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Notion APIの接続とデータ取得をテスト
 */
async function testNotionConnection() {
  console.log('🔍 Notion API接続テスト\n');

  // 環境変数の確認
  console.log('📋 環境変数の確認:');
  console.log(`  NOTION_API_KEY: ${process.env.NOTION_API_KEY ? '設定済み ✓' : '未設定 ✗'}`);
  console.log(`  NOTION_DATABASE_ID: ${process.env.NOTION_DATABASE_ID ? '設定済み ✓' : '未設定 ✗'}`);
  console.log();

  if (!process.env.NOTION_API_KEY || !process.env.NOTION_DATABASE_ID) {
    console.log('⚠️  Notion APIキーまたはDatabase IDが設定されていません');
    console.log('   .envファイルを確認してください\n');
    return;
  }

  try {
    console.log('📚 Notionからドキュメントを取得中...\n');
    const documents = await getAllDocuments();

    console.log(`✅ 成功！${documents.length}件のドキュメントを取得しました\n`);

    // 取得したドキュメントの詳細を表示
    documents.forEach((doc, index) => {
      console.log(`\n━━━ ドキュメント ${index + 1} ━━━`);
      console.log(`タイトル: ${doc.title}`);
      console.log(`ID: ${doc.id}`);
      console.log(`最終更新: ${doc.lastEdited}`);
      console.log(`URL: ${doc.url}`);
      console.log(`コンテンツ長: ${doc.content.length}文字`);

      // コンテンツのプレビュー（最初の200文字）
      const preview = doc.content.substring(0, 200).replace(/\n/g, ' ');
      console.log(`プレビュー: ${preview}${doc.content.length > 200 ? '...' : ''}`);
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🎉 Notion APIは正常に動作しています！\n');
    console.log('次のステップ:');
    console.log('  npm run index     # ドキュメントをインデックス化');
    console.log('  npm start         # サーバーを起動\n');

  } catch (error) {
    console.error('❌ エラーが発生しました:\n');
    console.error(`  エラー種別: ${error.name}`);
    console.error(`  メッセージ: ${error.message}\n`);

    // よくあるエラーと対処法
    if (error.message.includes('Unauthorized') || error.code === 'unauthorized') {
      console.log('💡 対処法:');
      console.log('  1. Notion Integration Tokenが正しいか確認');
      console.log('  2. IntegrationがデータベースにConnectされているか確認');
      console.log('     → データベースページ > ... > Connections\n');
    } else if (error.message.includes('object_not_found') || error.message.includes('Could not find')) {
      console.log('💡 対処法:');
      console.log('  1. Database IDが正しいか確認');
      console.log('  2. データベースのURLから正しいIDをコピー');
      console.log('     例: https://notion.so/xxx/DATABASE_ID?v=yyy\n');
    } else if (error.message.includes('EAI_AGAIN') || error.message.includes('getaddrinfo')) {
      console.log('💡 対処法:');
      console.log('  この環境ではNotion APIに接続できません');
      console.log('  ローカル環境（あなたのPC）で実行してください\n');
    }
  }
}

// スクリプトとして実行された場合
if (import.meta.url === `file://${process.argv[1]}`) {
  testNotionConnection();
}

export default testNotionConnection;
