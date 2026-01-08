import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * モックの埋め込みベクトルを生成（OpenAI API利用不可時のフォールバック）
 * @param {string} text - テキスト
 * @param {number} dimension - ベクトル次元数
 * @returns {Array<number>} 埋め込みベクトル
 */
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

/**
 * テキストをベクトル埋め込みに変換
 * @param {string} text - 埋め込みを生成するテキスト
 * @returns {Promise<Array<number>>} 埋め込みベクトル
 */
export async function generateEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.warn('OpenAI API unavailable, using mock embedding:', error.message);
    // フォールバック：モック埋め込みを使用
    return generateMockEmbedding(text);
  }
}

/**
 * 複数のテキストを一括で埋め込みに変換
 * @param {Array<string>} texts - 埋め込みを生成するテキストの配列
 * @returns {Promise<Array<Array<number>>>} 埋め込みベクトルの配列
 */
export async function generateEmbeddings(texts) {
  try {
    // OpenAI APIは一度に複数の入力を処理できる
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: texts,
    });

    return response.data.map((item) => item.embedding);
  } catch (error) {
    console.warn('OpenAI API unavailable, using mock embeddings:', error.message);
    // フォールバック：モック埋め込みを使用
    return texts.map((text) => generateMockEmbedding(text));
  }
}

/**
 * ドキュメントをチャンク分割して埋め込みを生成
 * @param {Object} document - ドキュメントオブジェクト
 * @param {number} chunkSize - チャンクサイズ（文字数）
 * @param {number} overlap - オーバーラップサイズ
 * @returns {Promise<Array>} チャンクと埋め込みの配列
 */
export async function generateDocumentEmbeddings(
  document,
  chunkSize = 1000,
  overlap = 200
) {
  const chunks = splitIntoChunks(document.content, chunkSize, overlap);

  const embeddings = await generateEmbeddings(chunks);

  return chunks.map((chunk, index) => ({
    id: `${document.id}-chunk-${index}`,
    documentId: document.id,
    title: document.title,
    content: chunk,
    embedding: embeddings[index],
    url: document.url,
  }));
}

/**
 * テキストをチャンクに分割
 * @param {string} text - 分割するテキスト
 * @param {number} chunkSize - チャンクサイズ
 * @param {number} overlap - オーバーラップサイズ
 * @returns {Array<string>} チャンクの配列
 */
function splitIntoChunks(text, chunkSize, overlap) {
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

/**
 * コサイン類似度を計算
 * @param {Array<number>} vectorA - ベクトルA
 * @param {Array<number>} vectorB - ベクトルB
 * @returns {number} コサイン類似度（0〜1）
 */
export function cosineSimilarity(vectorA, vectorB) {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    magnitudeA += vectorA[i] * vectorA[i];
    magnitudeB += vectorB[i] * vectorB[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (magnitudeA * magnitudeB);
}
