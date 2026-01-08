import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import chatRouter from './routes/chat.js';
import vectorStore from './services/vectorStore.js';

// ES Modulesで__dirnameを取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェア
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静的ファイル（フロントエンド）の配信
const frontendPath = path.join(__dirname, '../../frontend');
app.use(express.static(frontendPath));

// APIルート
app.use('/api', chatRouter);

// ルートへのアクセスでindex.htmlを返す
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// 404ハンドラ
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// エラーハンドラ
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

// サーバー起動
async function startServer() {
  try {
    console.log('🚀 Starting server...\n');

    // ベクトルストアを読み込み
    console.log('📚 Loading vector store...');
    await vectorStore.load();

    if (vectorStore.size() === 0) {
      console.log('\n⚠️  Warning: Vector store is empty!');
      console.log('Please run "npm run index" to index documents first.\n');
    } else {
      console.log(`✓ Loaded ${vectorStore.size()} vectors\n`);
    }

    // サーバー起動
    app.listen(PORT, () => {
      console.log(`✅ Server is running on http://localhost:${PORT}`);
      console.log(`📱 Open your browser and visit: http://localhost:${PORT}\n`);
      console.log('API Endpoints:');
      console.log(`  POST http://localhost:${PORT}/api/chat`);
      console.log(`  GET  http://localhost:${PORT}/api/health\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
