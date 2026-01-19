/**
 * 表情分析結果を表示するUIユーティリティ
 */

import type { EmotionResult } from '@/types/emotion';
import { EMOTIONS } from '@/types/emotion';
import type { VisitorStats } from './visitorStats';
import { calculateEmotionPercentages } from './visitorStats';
import { generateInteractiveMessage } from './interactiveMessages';

/**
 * オーバーレイのルート要素を取得または作成
 */
function ensureOverlayRoot(): HTMLElement {
  let root = document.getElementById('emotion-overlay-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'emotion-overlay-root';
    root.className = 'fixed inset-0 pointer-events-none z-[11000]';
    document.body.appendChild(root);
  }
  return root;
}

/**
 * HTMLエスケープ
 */
function escapeHtml(str: string): string {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

/**
 * 表情分析結果をステッカー形式で表示
 */
export function showEmotionSticker(result: EmotionResult): void {
  const root = ensureOverlayRoot();
  const emotionData = EMOTIONS[result.emotion];

  const sticker = document.createElement('div');
  const tilt = (Math.random() * 10 - 5).toFixed(2);
  const left = Math.round(18 + Math.random() * 220);
  const bottom = Math.round(90 + Math.random() * 140);
  const r1 = 40 + Math.round(Math.random() * 30);
  const r2 = 30 + Math.round(Math.random() * 40);

  sticker.className = 'pointer-events-none fixed';
  sticker.style.left = `${left}px`;
  sticker.style.bottom = `${bottom}px`;
  sticker.style.transform = `rotate(${tilt}deg) scale(0.95)`;
  sticker.style.opacity = '0';

  sticker.innerHTML = `
    <div style="border-radius:${r1}% ${r2}% ${r1}% ${r2}% / ${r2}% ${r1}% ${r2}% ${r1}%; background: ${emotionData.color};"
      class="text-white shadow-2xl px-6 py-4 w-[300px] max-w-[90vw]">
      <div class="text-4xl mb-2 text-center">${emotionData.icon}</div>
      <div class="text-lg font-black tracking-wide text-center">${escapeHtml(emotionData.ja)}</div>
      <div class="text-sm opacity-95 mt-1 leading-relaxed text-center">${escapeHtml(emotionData.description)}</div>
      <div class="text-xs opacity-90 mt-2 text-center">確信度: ${result.confidence}%</div>
    </div>
  `;

  root.appendChild(sticker);
  requestAnimationFrame(() => {
    sticker.style.transition = 'opacity 180ms ease-out, transform 220ms ease-out';
    sticker.style.opacity = '1';
    sticker.style.transform = `rotate(${tilt}deg) scale(1)`;
  });

  window.setTimeout(() => {
    sticker.style.transition = 'opacity 240ms ease-in, transform 240ms ease-in';
    sticker.style.opacity = '0';
    sticker.style.transform = `rotate(${tilt}deg) scale(0.92) translateY(10px)`;
    window.setTimeout(() => sticker.remove(), 300);
  }, 4500);
}

/**
 * 表情分析結果をモーダル形式で表示
 */
export function showEmotionModal(result: EmotionResult): void {
  const root = ensureOverlayRoot();
  const emotionData = EMOTIONS[result.emotion];

  const modal = document.createElement('div');
  modal.className = 'pointer-events-auto fixed inset-0 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm';
  modal.style.opacity = '0';

  // すべての感情スコアをバー表示
  const scoresHTML = Object.entries(result.allScores)
    .sort(([, a], [, b]) => b - a)
    .map(([emotion, score]) => {
      const data = EMOTIONS[emotion as keyof typeof EMOTIONS];
      const percentage = Math.round(score * 100);
      return `
        <div class="flex items-center gap-3 mb-2">
          <div class="text-2xl w-10 text-center">${data.icon}</div>
          <div class="flex-1">
            <div class="flex justify-between text-sm mb-1">
              <span class="font-semibold">${data.ja}</span>
              <span class="text-gray-600">${percentage}%</span>
            </div>
            <div class="bg-gray-200 rounded-full h-2 overflow-hidden">
              <div class="h-full rounded-full transition-all duration-300"
                style="width: ${percentage}%; background-color: ${data.color};"></div>
            </div>
          </div>
        </div>
      `;
    })
    .join('');

  modal.innerHTML = `
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden modal-enter">
      <div class="p-6" style="background: linear-gradient(135deg, ${emotionData.color}20, ${emotionData.color}40);">
        <div class="text-center">
          <div class="text-6xl mb-3">${emotionData.icon}</div>
          <h2 class="text-2xl font-bold mb-2" style="color: ${emotionData.color};">${escapeHtml(emotionData.ja)}</h2>
          <p class="text-gray-700 text-lg mb-2">${escapeHtml(emotionData.description)}</p>
          <div class="inline-block bg-white/80 px-4 py-2 rounded-full text-sm font-semibold">
            確信度: ${result.confidence}%
          </div>
        </div>
      </div>

      <div class="p-6 bg-gray-50">
        <h3 class="font-bold text-gray-800 mb-3">すべての感情スコア</h3>
        ${scoresHTML}
      </div>

      <div class="p-4 border-t border-gray-200 text-center">
        <button id="close-emotion-modal" class="px-6 py-2 bg-gray-800 text-white rounded-full font-semibold hover:bg-gray-700 transition">
          閉じる
        </button>
      </div>
    </div>
  `;

  root.appendChild(modal);

  // アニメーション開始
  requestAnimationFrame(() => {
    modal.style.transition = 'opacity 200ms ease-out';
    modal.style.opacity = '1';
  });

  // 閉じるボタンのイベント
  const closeBtn = modal.querySelector('#close-emotion-modal') as HTMLButtonElement;
  const closeModal = () => {
    modal.style.opacity = '0';
    setTimeout(() => modal.remove(), 200);
  };

  closeBtn?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}

/**
 * 「顔が検出されませんでした」メッセージを表示
 */
export function showNoFaceDetectedMessage(): void {
  const root = ensureOverlayRoot();

  const message = document.createElement('div');
  message.className = 'pointer-events-none fixed';
  message.style.left = '50%';
  message.style.top = '50%';
  message.style.transform = 'translate(-50%, -50%) scale(0.9)';
  message.style.opacity = '0';

  message.innerHTML = `
    <div class="bg-white rounded-2xl shadow-2xl px-8 py-6 text-center">
      <div class="text-5xl mb-3">👀</div>
      <div class="text-lg font-bold text-gray-800 mb-2">顔が検出されませんでした</div>
      <div class="text-sm text-gray-600">写真に顔が含まれていることを確認してください</div>
    </div>
  `;

  root.appendChild(message);

  requestAnimationFrame(() => {
    message.style.transition = 'opacity 200ms ease-out, transform 200ms ease-out';
    message.style.opacity = '1';
    message.style.transform = 'translate(-50%, -50%) scale(1)';
  });

  setTimeout(() => {
    message.style.opacity = '0';
    message.style.transform = 'translate(-50%, -50%) scale(0.9)';
    setTimeout(() => message.remove(), 200);
  }, 3000);
}

/**
 * 分析中のローディング表示
 */
export function showAnalyzingLoader(): { hide: () => void } {
  const root = ensureOverlayRoot();

  const loader = document.createElement('div');
  loader.className = 'pointer-events-auto fixed inset-0 bg-black/30 flex items-center justify-center backdrop-blur-sm';
  loader.style.opacity = '0';

  loader.innerHTML = `
    <div class="bg-white rounded-2xl shadow-2xl px-8 py-6 text-center">
      <div class="animate-spin text-5xl mb-3">🔄</div>
      <div class="text-lg font-bold text-gray-800 mb-1">表情を分析中...</div>
      <div class="text-sm text-gray-600">しばらくお待ちください</div>
    </div>
  `;

  root.appendChild(loader);

  requestAnimationFrame(() => {
    loader.style.transition = 'opacity 200ms ease-out';
    loader.style.opacity = '1';
  });

  return {
    hide: () => {
      loader.style.opacity = '0';
      setTimeout(() => loader.remove(), 200);
    },
  };
}

/**
 * インタラクティブな表情分析結果をカード形式で表示
 */
export function showInteractiveEmotionResult(
  result: EmotionResult,
  visitorNumber: number,
  stats: VisitorStats
): void {
  const root = ensureOverlayRoot();
  const emotionData = EMOTIONS[result.emotion];
  const message = generateInteractiveMessage(result.emotion, visitorNumber, stats);
  const percentages = calculateEmotionPercentages(stats);

  const card = document.createElement('div');
  card.className = 'pointer-events-auto fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] max-w-[92vw]';
  card.style.opacity = '0';
  card.style.transform = 'translate(-50%, -50%) scale(0.9)';

  // 統計バーのHTML生成
  const statsHTML = Object.entries(percentages)
    .filter(([, percentage]) => percentage > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([emotion, percentage]) => {
      const data = EMOTIONS[emotion as keyof typeof EMOTIONS];
      return `
        <div class="flex items-center gap-2 mb-2">
          <div class="text-xl w-6">${data.icon}</div>
          <div class="flex-1">
            <div class="flex justify-between text-xs mb-1">
              <span class="font-medium text-gray-700">${data.ja}</span>
              <span class="text-gray-500">${percentage}%</span>
            </div>
            <div class="bg-gray-200 rounded-full h-2 overflow-hidden">
              <div class="h-full rounded-full transition-all duration-500"
                style="width: ${percentage}%; background-color: ${data.color};"></div>
            </div>
          </div>
        </div>
      `;
    })
    .join('');

  card.innerHTML = `
    <div class="bg-white rounded-3xl shadow-2xl overflow-hidden">
      <!-- ヘッダー -->
      <div class="p-6 text-center" style="background: linear-gradient(135deg, ${emotionData.color}30, ${emotionData.color}50);">
        <div class="text-6xl mb-3 animate-bounce">${emotionData.icon}</div>
        <div class="text-2xl font-bold mb-2" style="color: ${emotionData.color};">${escapeHtml(emotionData.ja)}</div>
        <div class="text-sm text-gray-600 mb-1">${escapeHtml(message.greeting)}</div>
        <div class="text-xs text-gray-500">${escapeHtml(message.visitorInfo)}</div>
      </div>

      <!-- メインメッセージ -->
      <div class="p-6 bg-gradient-to-b from-white to-gray-50">
        <div class="mb-4">
          <div class="flex items-start gap-3 mb-3">
            <div class="text-2xl">${message.emotionMessage.greeting}</div>
            <div class="flex-1">
              <p class="text-base font-semibold text-gray-800 mb-2">
                ${escapeHtml(message.emotionMessage.mainMessage)}
              </p>
              <p class="text-sm text-gray-600 mb-2">
                ${escapeHtml(message.emotionMessage.followUp)}
              </p>
              ${message.emotionMessage.suggestion ? `
                <p class="text-sm text-blue-600 italic">
                  💡 ${escapeHtml(message.emotionMessage.suggestion)}
                </p>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- 確信度 -->
        <div class="mb-4 p-3 bg-white rounded-xl border border-gray-200">
          <div class="flex justify-between items-center mb-2">
            <span class="text-xs font-semibold text-gray-600">確信度</span>
            <span class="text-lg font-bold" style="color: ${emotionData.color};">${result.confidence}%</span>
          </div>
          <div class="bg-gray-200 rounded-full h-2 overflow-hidden">
            <div class="h-full rounded-full transition-all duration-500"
              style="width: ${result.confidence}%; background-color: ${emotionData.color};"></div>
          </div>
        </div>

        <!-- 統計情報 -->
        ${stats.totalVisitors > 1 ? `
          <div class="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div class="flex items-center gap-2 mb-3">
              <span class="text-xl">📊</span>
              <span class="font-bold text-gray-800">来場者統計</span>
            </div>
            <p class="text-sm text-gray-700 mb-3">
              ${escapeHtml(message.statsMessage)}
            </p>
            <div class="space-y-2">
              ${statsHTML}
            </div>
          </div>
        ` : ''}
      </div>

      <!-- フッター -->
      <div class="p-4 bg-gray-100 border-t border-gray-200 flex gap-3">
        <button id="close-interactive-result" class="flex-1 px-4 py-3 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-700 transition">
          閉じる
        </button>
        <button id="show-detailed-stats" class="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition">
          詳細統計を見る
        </button>
      </div>
    </div>
  `;

  root.appendChild(card);

  // アニメーション
  requestAnimationFrame(() => {
    card.style.transition = 'opacity 300ms ease-out, transform 300ms ease-out';
    card.style.opacity = '1';
    card.style.transform = 'translate(-50%, -50%) scale(1)';
  });

  // イベントリスナー
  const closeBtn = card.querySelector('#close-interactive-result') as HTMLButtonElement;
  const statsBtn = card.querySelector('#show-detailed-stats') as HTMLButtonElement;

  const closeCard = () => {
    card.style.opacity = '0';
    card.style.transform = 'translate(-50%, -50%) scale(0.9)';
    setTimeout(() => card.remove(), 300);
  };

  closeBtn?.addEventListener('click', closeCard);
  statsBtn?.addEventListener('click', () => {
    closeCard();
    setTimeout(() => showDetailedStats(stats), 100);
  });

  // 自動で閉じる（10秒後）
  setTimeout(() => {
    if (card.parentNode) {
      closeCard();
    }
  }, 10000);
}

/**
 * 詳細統計をモーダルで表示
 */
export function showDetailedStats(stats: VisitorStats): void {
  const root = ensureOverlayRoot();
  const percentages = calculateEmotionPercentages(stats);

  const modal = document.createElement('div');
  modal.className = 'pointer-events-auto fixed inset-0 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm';
  modal.style.opacity = '0';

  const statsHTML = Object.entries(percentages)
    .sort(([, a], [, b]) => b - a)
    .map(([emotion, percentage]) => {
      const data = EMOTIONS[emotion as keyof typeof EMOTIONS];
      const count = stats.emotionCounts[emotion as keyof typeof stats.emotionCounts];
      return `
        <div class="p-4 bg-gray-50 rounded-xl">
          <div class="flex items-center gap-3 mb-2">
            <div class="text-3xl">${data.icon}</div>
            <div class="flex-1">
              <div class="font-bold text-gray-800">${data.ja}</div>
              <div class="text-sm text-gray-600">${data.description}</div>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold" style="color: ${data.color};">${percentage}%</div>
              <div class="text-xs text-gray-500">${count}人</div>
            </div>
          </div>
          <div class="bg-gray-200 rounded-full h-3 overflow-hidden">
            <div class="h-full rounded-full transition-all duration-500"
              style="width: ${percentage}%; background-color: ${data.color};"></div>
          </div>
        </div>
      `;
    })
    .join('');

  modal.innerHTML = `
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
      <div class="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <h2 class="text-2xl font-bold mb-2">📊 詳細統計レポート</h2>
        <p class="text-sm opacity-90">総来場者数: ${stats.totalVisitors}人</p>
      </div>

      <div class="p-6 max-h-[70vh] overflow-y-auto space-y-3">
        ${statsHTML}
      </div>

      <div class="p-4 bg-gray-100 border-t border-gray-200 text-center">
        <button id="close-detailed-stats" class="px-6 py-3 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-700 transition">
          閉じる
        </button>
      </div>
    </div>
  `;

  root.appendChild(modal);

  requestAnimationFrame(() => {
    modal.style.transition = 'opacity 200ms ease-out';
    modal.style.opacity = '1';
  });

  const closeBtn = modal.querySelector('#close-detailed-stats') as HTMLButtonElement;
  const closeModal = () => {
    modal.style.opacity = '0';
    setTimeout(() => modal.remove(), 200);
  };

  closeBtn?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}
