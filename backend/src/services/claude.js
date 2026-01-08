import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * RAG回答を生成
 * @param {string} question - ユーザーの質問
 * @param {Array} relevantDocs - 関連ドキュメント
 * @returns {Promise<Object>} 回答と使用したソース
 */
export async function generateAnswer(question, relevantDocs) {
  const context = buildContext(relevantDocs);
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(question, context);

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const answer = message.content[0].text;

    return {
      answer,
      sources: relevantDocs.map((doc) => ({
        title: doc.title,
        url: doc.url,
        similarity: doc.similarity,
      })),
    };
  } catch (error) {
    console.error('Error generating answer with Claude:', error);
    throw error;
  }
}

/**
 * システムプロンプトを構築
 * @returns {string} システムプロンプト
 */
function buildSystemPrompt() {
  return `あなたは「mikan for School」（教育機関向け英語学習サービス）の専門サポートアシスタントです。

# あなたの役割
- 導入済み学校の先生方からの質問に、正確で実用的な回答を提供する
- Notionナレッジベースの情報を基に回答する
- 具体的で分かりやすい説明を心がける

# 回答の方針
1. **正確性**: ナレッジベースの情報に基づいて回答する
2. **具体性**: 手順は番号付きリストで明確に示す
3. **親切さ**: 先生の立場に立って、実践的なアドバイスを含める
4. **簡潔さ**: 要点を押さえつつ、必要な情報は漏らさない

# 回答に含めるべき内容
- 質問への直接的な回答
- 具体的な手順（該当する場合）
- 注意点やヒント
- 関連する機能やベストプラクティス（該当する場合）

# 回答に含めないべき内容
- ナレッジベースにない推測や不確実な情報
- 技術的すぎる詳細
- 関係のない情報

# トーン
- 丁寧で親しみやすい
- 専門的だが堅苦しくない
- 先生を尊重し、サポートする姿勢`;
}

/**
 * ユーザープロンプトを構築
 * @param {string} question - 質問
 * @param {string} context - コンテキスト
 * @returns {string} ユーザープロンプト
 */
function buildUserPrompt(question, context) {
  return `# ナレッジベース（関連情報）

${context}

---

# 先生からの質問

${question}

---

上記のナレッジベースの情報を参考にして、先生の質問に回答してください。
ナレッジベースに情報がない場合は、「この件については、マニュアルに記載がないため、サポートチームに直接お問い合わせいただくことをお勧めします」と伝えてください。`;
}

/**
 * 関連ドキュメントからコンテキストを構築
 * @param {Array} relevantDocs - 関連ドキュメント
 * @returns {string} コンテキスト文字列
 */
function buildContext(relevantDocs) {
  if (relevantDocs.length === 0) {
    return '（関連する情報が見つかりませんでした）';
  }

  return relevantDocs
    .map((doc, index) => {
      return `## ドキュメント ${index + 1}: ${doc.title}

${doc.content}

---`;
    })
    .join('\n\n');
}

/**
 * ストリーミングでRAG回答を生成
 * @param {string} question - ユーザーの質問
 * @param {Array} relevantDocs - 関連ドキュメント
 * @param {Function} onChunk - チャンクを受け取るコールバック
 * @returns {Promise<Object>} 最終的な回答と使用したソース
 */
export async function generateAnswerStream(question, relevantDocs, onChunk) {
  const context = buildContext(relevantDocs);
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(question, context);

  try {
    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    let fullAnswer = '';

    for await (const chunk of stream) {
      if (
        chunk.type === 'content_block_delta' &&
        chunk.delta.type === 'text_delta'
      ) {
        const text = chunk.delta.text;
        fullAnswer += text;
        onChunk(text);
      }
    }

    return {
      answer: fullAnswer,
      sources: relevantDocs.map((doc) => ({
        title: doc.title,
        url: doc.url,
        similarity: doc.similarity,
      })),
    };
  } catch (error) {
    console.error('Error generating answer stream with Claude:', error);
    throw error;
  }
}
