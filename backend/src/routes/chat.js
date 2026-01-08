import express from 'express';
import { generateEmbedding } from '../services/embedding.js';
import vectorStore from '../services/vectorStore.js';
import { generateAnswer, generateAnswerStream } from '../services/claude.js';

const router = express.Router();

/**
 * POST /api/chat
 * チャットメッセージを受け取り、RAG回答を返す
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, stream = false } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Message is required and must be a string',
      });
    }

    console.log(`📩 Received question: ${message}`);

    // 質問の埋め込みを生成
    const queryEmbedding = await generateEmbedding(message);

    // 関連ドキュメントを検索
    const relevantDocs = vectorStore.search(queryEmbedding, 3, 0.3);

    console.log(
      `🔍 Found ${relevantDocs.length} relevant documents:`,
      relevantDocs.map((d) => `${d.title} (${d.similarity.toFixed(3)})`)
    );

    // ストリーミングモード
    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      // チャンクごとにストリーミング送信
      const result = await generateAnswerStream(
        message,
        relevantDocs,
        (chunk) => {
          res.write(`data: ${JSON.stringify({ type: 'chunk', text: chunk })}\n\n`);
        }
      );

      // 最後にソース情報を送信
      res.write(
        `data: ${JSON.stringify({ type: 'sources', sources: result.sources })}\n\n`
      );
      res.write('data: [DONE]\n\n');
      res.end();
    } else {
      // 通常モード
      const result = await generateAnswer(message, relevantDocs);

      res.json({
        answer: result.answer,
        sources: result.sources,
      });
    }
  } catch (error) {
    console.error('❌ Error in chat endpoint:', error);

    if (!res.headersSent) {
      res.status(500).json({
        error: 'Failed to generate answer',
        message: error.message,
      });
    }
  }
});

/**
 * GET /api/health
 * ヘルスチェックエンドポイント
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    vectorStoreSize: vectorStore.size(),
    timestamp: new Date().toISOString(),
  });
});

export default router;
