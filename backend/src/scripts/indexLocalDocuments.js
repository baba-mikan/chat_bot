import fs from 'fs/promises';
import path from 'path';
import pdfParse from 'pdf-parse';
import { generateDocumentEmbeddings } from '../services/embedding.js';
import vectorStore from '../services/vectorStore.js';

/**
 * PDFファイルからドキュメントを読み込み
 * @param {string} filePath - PDFファイルのパス
 * @returns {Promise<Object>} ドキュメントオブジェクト
 */
async function loadPdfDocument(filePath) {
  const dataBuffer = await fs.readFile(filePath);
  const data = await pdfParse(dataBuffer);

  const fileName = path.basename(filePath, '.pdf');

  return {
    id: `pdf-${fileName}`,
    title: fileName,
    content: data.text,
    url: `file://${filePath}`,
    lastEdited: new Date().toISOString(),
  };
}

/**
 * テキストファイルからドキュメントを読み込み
 * @param {string} filePath - テキストファイルのパス
 * @returns {Promise<Object>} ドキュメントオブジェクト
 */
async function loadTextDocument(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  const fileName = path.basename(filePath, path.extname(filePath));

  return {
    id: `text-${fileName}`,
    title: fileName,
    content: content,
    url: `file://${filePath}`,
    lastEdited: new Date().toISOString(),
  };
}

/**
 * ディレクトリ内のすべてのファイルを読み込み
 * @param {string} dirPath - ディレクトリパス
 * @returns {Promise<Array>} ドキュメントの配列
 */
async function loadDocumentsFromDirectory(dirPath) {
  const documents = [];

  try {
    const files = await fs.readdir(dirPath);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = await fs.stat(filePath);

      if (stat.isFile()) {
        const ext = path.extname(file).toLowerCase();

        try {
          if (ext === '.pdf') {
            console.log(`  Reading PDF: ${file}`);
            const doc = await loadPdfDocument(filePath);
            documents.push(doc);
          } else if (['.txt', '.md'].includes(ext)) {
            console.log(`  Reading text: ${file}`);
            const doc = await loadTextDocument(filePath);
            documents.push(doc);
          }
        } catch (error) {
          console.error(`  ✗ Failed to read ${file}:`, error.message);
        }
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error);
  }

  return documents;
}

/**
 * ローカルファイルからドキュメントをインデックス化
 */
async function indexLocalDocuments() {
  console.log('🚀 Starting local document indexing...\n');

  const docsDir = path.join(process.cwd(), 'docs');

  // docsディレクトリの存在確認
  try {
    await fs.access(docsDir);
  } catch (error) {
    console.log('📁 "docs" ディレクトリが見つかりません。作成します...');
    await fs.mkdir(docsDir, { recursive: true });
    console.log(`✓ ディレクトリを作成しました: ${docsDir}\n`);
    console.log('📝 使い方:');
    console.log('  1. PDFやテキストファイルを docs/ フォルダに配置してください');
    console.log('  2. もう一度 npm run index:local を実行してください\n');
    console.log('対応フォーマット:');
    console.log('  - PDF (.pdf)');
    console.log('  - テキスト (.txt)');
    console.log('  - Markdown (.md)\n');
    return;
  }

  try {
    // ファイルを読み込み
    console.log('📚 Loading documents from docs/...\n');
    const documents = await loadDocumentsFromDirectory(docsDir);

    if (documents.length === 0) {
      console.log('⚠️  ドキュメントが見つかりませんでした\n');
      console.log('📝 使い方:');
      console.log('  1. PDFやテキストファイルを docs/ フォルダに配置してください');
      console.log('  2. もう一度 npm run index:local を実行してください\n');
      console.log('対応フォーマット:');
      console.log('  - PDF (.pdf)');
      console.log('  - テキスト (.txt)');
      console.log('  - Markdown (.md)\n');
      return;
    }

    console.log(`✓ Loaded ${documents.length} documents\n`);

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
    console.log('\n次のステップ:');
    console.log('  npm start     # サーバーを起動\n');
  } catch (error) {
    console.error('❌ Error during indexing:', error);
    process.exit(1);
  }
}

// スクリプトとして実行された場合
if (import.meta.url === `file://${process.argv[1]}`) {
  indexLocalDocuments();
}

export default indexLocalDocuments;
