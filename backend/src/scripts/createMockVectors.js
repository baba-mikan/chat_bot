import { getMockDocuments } from '../services/notion.js';
import vectorStore from '../services/vectorStore.js';

/**
 * モックの埋め込みベクトルを生成
 * OpenAI APIなしでテスト用のベクトルデータを作成
 */

// シンプルなハッシュ関数でテキストからベクトルを生成
function generateMockEmbedding(text, dimension = 1536) {
  const vector = new Array(dimension).fill(0);

  // テキストの特徴を基にベクトルを生成
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    const index = charCode % dimension;
    vector[index] += Math.sin(charCode * 0.01) * 0.1;
  }

  // 正規化
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    for (let i = 0; i < dimension; i++) {
      vector[i] /= magnitude;
    }
  }

  return vector;
}

// ドキュメントをチャンクに分割
function splitIntoChunks(text, chunkSize = 1000, overlap = 200) {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const end = start + chunkSize;
    const chunk = text.slice(start, end);

    if (chunk.trim().length > 0) {
      chunks.push(chunk.trim());
    }

    start = end - overlap;
  }

  return chunks.length > 0 ? chunks : [text];
}

async function createMockVectors() {
  console.log('🚀 Creating mock vector store...\n');

  try {
    // モックドキュメントを取得
    console.log('📚 Loading mock documents...');
    const documents = getMockDocuments();
    console.log(`✓ Loaded ${documents.length} mock documents\n`);

    // 既存のベクトルストアをクリア
    vectorStore.clear();

    // 各ドキュメントを処理
    console.log('🔄 Generating mock embeddings...\n');

    for (const doc of documents) {
      console.log(`Processing: ${doc.title}`);

      // ドキュメントをチャンクに分割
      const chunks = splitIntoChunks(doc.content);

      console.log(`  ✓ Split into ${chunks.length} chunks`);

      // 各チャンクのベクトルを生成
      chunks.forEach((chunk, index) => {
        const embedding = generateMockEmbedding(doc.title + ' ' + chunk);

        vectorStore.add({
          id: `${doc.id}-chunk-${index}`,
          documentId: doc.id,
          title: doc.title,
          content: chunk,
          embedding: embedding,
          url: doc.url,
        });
      });
    }

    console.log(`\n✅ Successfully created mock vectors`);
    console.log(`📊 Total chunks: ${vectorStore.size()}\n`);

    // ベクトルストアをファイルに保存
    console.log('💾 Saving vector store...');
    await vectorStore.save();
    console.log('✓ Vector store saved successfully\n');

    console.log('🎉 Mock vector store created!');
    console.log('\n💡 Note: This is using mock embeddings for testing.');
    console.log('   For production, run with proper OpenAI API access.\n');
  } catch (error) {
    console.error('❌ Error creating mock vectors:', error);
    process.exit(1);
  }
}

// スクリプトとして実行された場合
if (import.meta.url === `file://${process.argv[1]}`) {
  createMockVectors();
}

export default createMockVectors;
