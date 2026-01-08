import { cosineSimilarity } from './embedding.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * インメモリベクトルストア
 * シンプルなコサイン類似度検索を実装
 */
class VectorStore {
  constructor() {
    this.vectors = [];
    this.dataPath = path.join(process.cwd(), 'data', 'vectors.json');
  }

  /**
   * ベクトルを追加
   * @param {Object} item - { id, documentId, title, content, embedding, url }
   */
  add(item) {
    this.vectors.push(item);
  }

  /**
   * 複数のベクトルを一括追加
   * @param {Array} items - ベクトルアイテムの配列
   */
  addMany(items) {
    this.vectors.push(...items);
  }

  /**
   * クエリベクトルに最も類似したベクトルを検索
   * @param {Array<number>} queryEmbedding - クエリの埋め込みベクトル
   * @param {number} topK - 返す結果の数
   * @param {number} minSimilarity - 最小類似度（0〜1）
   * @returns {Array} 類似度の高い順にソートされた結果
   */
  search(queryEmbedding, topK = 5, minSimilarity = 0.3) {
    const results = this.vectors.map((item) => ({
      ...item,
      similarity: cosineSimilarity(queryEmbedding, item.embedding),
    }));

    return results
      .filter((item) => item.similarity >= minSimilarity)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK)
      .map((item) => {
        // embedding は返さない（サイズが大きいため）
        const { embedding, ...rest } = item;
        return rest;
      });
  }

  /**
   * ストアをクリア
   */
  clear() {
    this.vectors = [];
  }

  /**
   * ストアのサイズを取得
   * @returns {number} 格納されているベクトルの数
   */
  size() {
    return this.vectors.length;
  }

  /**
   * ストアをファイルに保存
   */
  async save() {
    try {
      const dir = path.dirname(this.dataPath);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(this.dataPath, JSON.stringify(this.vectors, null, 2));
      console.log(`Vector store saved to ${this.dataPath}`);
    } catch (error) {
      console.error('Error saving vector store:', error);
      throw error;
    }
  }

  /**
   * ファイルからストアを読み込み
   */
  async load() {
    try {
      const data = await fs.readFile(this.dataPath, 'utf-8');
      this.vectors = JSON.parse(data);
      console.log(`Loaded ${this.vectors.length} vectors from ${this.dataPath}`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('No saved vector store found. Starting with empty store.');
      } else {
        console.error('Error loading vector store:', error);
        throw error;
      }
    }
  }
}

// シングルトンインスタンス
const vectorStore = new VectorStore();

export default vectorStore;
