import { getAllDocuments, getMockDocuments } from '../services/notion.js';
import { generateDocumentEmbeddings } from '../services/embedding.js';
import vectorStore from '../services/vectorStore.js';

/**
 * Notionドキュメントをインデックス化してベクトルストアに保存
 */
async function indexDocuments() {
  console.log('🚀 Starting document indexing...\n');

  try {
    // Notionからドキュメントを取得（APIキーがない場合はモックを使用）
    let documents;
    const useNotionAPI = process.env.NOTION_API_KEY && process.env.NOTION_DATABASE_ID;

    if (useNotionAPI) {
      console.log('📚 Fetching documents from Notion...');
      documents = await getAllDocuments();
      console.log(`✓ Fetched ${documents.length} documents from Notion\n`);
    } else {
      console.log('⚠️  Notion API keys not found. Using mock documents...');
      documents = getMockDocuments();
      console.log(`✓ Loaded ${documents.length} mock documents\n`);
    }

    // 既存のベクトルストアをクリア
    vectorStore.clear();

    // 各ドキュメントを処理
    console.log('🔄 Generating embeddings...\n');

    for (const doc of documents) {
      console.log(`Processing: ${doc.title}`);

      // ドキュメントをチャンクに分割して埋め込みを生成
      const chunks = await generateDocumentEmbeddings(doc);

      console.log(`  ✓ Generated ${chunks.length} chunks`);

      // ベクトルストアに追加
      vectorStore.addMany(chunks);
    }

    console.log(`\n✅ Successfully indexed ${documents.length} documents`);
    console.log(`📊 Total chunks: ${vectorStore.size()}\n`);

    // ベクトルストアをファイルに保存
    console.log('💾 Saving vector store...');
    await vectorStore.save();
    console.log('✓ Vector store saved successfully\n');

    console.log('🎉 Indexing completed!');
  } catch (error) {
    console.error('❌ Error during indexing:', error);
    process.exit(1);
  }
}

// スクリプトとして実行された場合
if (import.meta.url === `file://${process.argv[1]}`) {
  indexDocuments();
}

export default indexDocuments;
