// DOM要素
const messagesContainer = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const sampleQuestions = document.querySelectorAll('.sample-question');

// 状態管理
let isWaitingForResponse = false;

/**
 * メッセージを追加
 */
function addMessage(content, role = 'user', sources = null) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${role}`;

  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';

  // マークダウン風の変換（簡易版）
  let formattedContent = content
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');

  contentDiv.innerHTML = formattedContent;
  messageDiv.appendChild(contentDiv);

  // ソース情報を追加
  if (sources && sources.length > 0) {
    const sourcesDiv = document.createElement('div');
    sourcesDiv.className = 'sources';

    const sourcesTitle = document.createElement('h4');
    sourcesTitle.textContent = '📚 参照元:';
    sourcesDiv.appendChild(sourcesTitle);

    sources.forEach((source) => {
      const sourceItem = document.createElement('div');
      sourceItem.className = 'source-item';

      const link = document.createElement('a');
      link.href = source.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = source.title;

      const similarity = document.createElement('span');
      similarity.className = 'source-similarity';
      similarity.textContent = `(${(source.similarity * 100).toFixed(0)}%)`;

      sourceItem.appendChild(link);
      sourceItem.appendChild(similarity);
      sourcesDiv.appendChild(sourceItem);
    });

    messageDiv.appendChild(sourcesDiv);
  }

  messagesContainer.appendChild(messageDiv);
  scrollToBottom();
}

/**
 * ローディングインジケーターを追加
 */
function addLoadingIndicator() {
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'message assistant';
  loadingDiv.id = 'loading-indicator';

  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content loading';

  for (let i = 0; i < 3; i++) {
    const dot = document.createElement('div');
    dot.className = 'loading-dot';
    contentDiv.appendChild(dot);
  }

  loadingDiv.appendChild(contentDiv);
  messagesContainer.appendChild(loadingDiv);
  scrollToBottom();
}

/**
 * ローディングインジケーターを削除
 */
function removeLoadingIndicator() {
  const loadingIndicator = document.getElementById('loading-indicator');
  if (loadingIndicator) {
    loadingIndicator.remove();
  }
}

/**
 * エラーメッセージを表示
 */
function addErrorMessage(error) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message error-message';

  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';
  contentDiv.innerHTML = `
    <strong>エラーが発生しました</strong><br>
    ${error}<br><br>
    もう一度お試しいただくか、問題が続く場合はサポートチームにお問い合わせください。
  `;

  messageDiv.appendChild(contentDiv);
  messagesContainer.appendChild(messageDiv);
  scrollToBottom();
}

/**
 * 最下部にスクロール
 */
function scrollToBottom() {
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * メッセージを送信
 */
async function sendMessage(message) {
  if (!message.trim() || isWaitingForResponse) {
    return;
  }

  // ユーザーメッセージを表示
  addMessage(message, 'user');

  // 入力欄をクリア＆無効化
  messageInput.value = '';
  setInputState(false);
  isWaitingForResponse = true;

  // ローディング表示
  addLoadingIndicator();

  try {
    // APIリクエスト
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        stream: false,
      }),
    });

    removeLoadingIndicator();

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'サーバーエラーが発生しました');
    }

    const data = await response.json();

    // アシスタントの回答を表示
    addMessage(data.answer, 'assistant', data.sources);
  } catch (error) {
    removeLoadingIndicator();
    console.error('Error:', error);
    addErrorMessage(error.message);
  } finally {
    setInputState(true);
    isWaitingForResponse = false;
    messageInput.focus();
  }
}

/**
 * 入力欄の状態を設定
 */
function setInputState(enabled) {
  messageInput.disabled = !enabled;
  sendButton.disabled = !enabled;
}

/**
 * イベントリスナー
 */

// 送信ボタンクリック
sendButton.addEventListener('click', () => {
  sendMessage(messageInput.value);
});

// Enterキーで送信
messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage(messageInput.value);
  }
});

// サンプル質問クリック
sampleQuestions.forEach((button) => {
  button.addEventListener('click', () => {
    const question = button.getAttribute('data-question');
    messageInput.value = question;
    sendMessage(question);
  });
});

// 初期フォーカス
messageInput.focus();

// デバッグ用: ヘルスチェック
async function checkHealth() {
  try {
    const response = await fetch('/api/health');
    const data = await response.json();
    console.log('Server health:', data);
  } catch (error) {
    console.error('Health check failed:', error);
  }
}

checkHealth();
