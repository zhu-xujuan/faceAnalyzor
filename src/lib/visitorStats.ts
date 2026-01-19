/**
 * 来場者統計管理システム
 */

import type { EmotionType } from '@/types/emotion';

export interface VisitorStats {
  totalVisitors: number;
  emotionCounts: Record<EmotionType, number>;
  lastVisitTime: number;
}

const STATS_KEY = 'faceanalyzor_visitor_stats';

/**
 * 空の統計データを作成
 */
function createEmptyStats(): VisitorStats {
  return {
    totalVisitors: 0,
    emotionCounts: {
      happy: 0,
      sad: 0,
      angry: 0,
      surprised: 0,
      fearful: 0,
      disgusted: 0,
      neutral: 0,
      satisfied: 0,
      understanding: 0,
      intrigued: 0,
      confused: 0,
    },
    lastVisitTime: Date.now(),
  };
}

/**
 * 統計データを読み込む
 */
export function loadVisitorStats(): VisitorStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return createEmptyStats();

    const data = JSON.parse(raw) as Partial<VisitorStats>;
    const base = createEmptyStats();

    const emotionCounts = (data.emotionCounts || {}) as Partial<Record<EmotionType, number>>;
    return {
      totalVisitors: Number.isFinite(data.totalVisitors) ? Number(data.totalVisitors) : 0,
      emotionCounts: {
        happy: Number.isFinite(emotionCounts.happy) ? Number(emotionCounts.happy) : 0,
        sad: Number.isFinite(emotionCounts.sad) ? Number(emotionCounts.sad) : 0,
        angry: Number.isFinite(emotionCounts.angry) ? Number(emotionCounts.angry) : 0,
        surprised: Number.isFinite(emotionCounts.surprised) ? Number(emotionCounts.surprised) : 0,
        fearful: Number.isFinite(emotionCounts.fearful) ? Number(emotionCounts.fearful) : 0,
        disgusted: Number.isFinite(emotionCounts.disgusted) ? Number(emotionCounts.disgusted) : 0,
        neutral: Number.isFinite(emotionCounts.neutral) ? Number(emotionCounts.neutral) : 0,
        satisfied: Number.isFinite(emotionCounts.satisfied) ? Number(emotionCounts.satisfied) : 0,
        understanding: Number.isFinite(emotionCounts.understanding) ? Number(emotionCounts.understanding) : 0,
        intrigued: Number.isFinite(emotionCounts.intrigued) ? Number(emotionCounts.intrigued) : 0,
        confused: Number.isFinite(emotionCounts.confused) ? Number(emotionCounts.confused) : 0,
      },
      lastVisitTime: Number.isFinite(data.lastVisitTime) ? Number(data.lastVisitTime) : base.lastVisitTime,
    };
  } catch {
    return createEmptyStats();
  }
}

/**
 * 統計データを保存
 */
export function saveVisitorStats(stats: VisitorStats): void {
  stats.lastVisitTime = Date.now();
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

/**
 * 新しい来場者を記録
 */
export function recordVisitor(emotion: EmotionType): { visitorNumber: number; stats: VisitorStats } {
  const stats = loadVisitorStats();
  stats.totalVisitors += 1;
  stats.emotionCounts[emotion] += 1;
  saveVisitorStats(stats);

  return {
    visitorNumber: stats.totalVisitors,
    stats,
  };
}

/**
 * 各表情のパーセンテージを計算
 */
export function calculateEmotionPercentages(stats: VisitorStats): Record<EmotionType, number> {
  const total = stats.totalVisitors;
  if (total === 0) {
    return {
      happy: 0,
      sad: 0,
      angry: 0,
      surprised: 0,
      fearful: 0,
      disgusted: 0,
      neutral: 0,
      satisfied: 0,
      understanding: 0,
      intrigued: 0,
      confused: 0,
    };
  }

  return {
    happy: Math.round((stats.emotionCounts.happy / total) * 100),
    sad: Math.round((stats.emotionCounts.sad / total) * 100),
    angry: Math.round((stats.emotionCounts.angry / total) * 100),
    surprised: Math.round((stats.emotionCounts.surprised / total) * 100),
    fearful: Math.round((stats.emotionCounts.fearful / total) * 100),
    disgusted: Math.round((stats.emotionCounts.disgusted / total) * 100),
    neutral: Math.round((stats.emotionCounts.neutral / total) * 100),
    satisfied: Math.round((stats.emotionCounts.satisfied / total) * 100),
    understanding: Math.round((stats.emotionCounts.understanding / total) * 100),
    intrigued: Math.round((stats.emotionCounts.intrigued / total) * 100),
    confused: Math.round((stats.emotionCounts.confused / total) * 100),
  };
}

/**
 * 最も多い表情を取得
 */
export function getMostCommonEmotion(stats: VisitorStats): EmotionType {
  let maxEmotion: EmotionType = 'neutral';
  let maxCount = 0;

  Object.entries(stats.emotionCounts).forEach(([emotion, count]) => {
    if (count > maxCount) {
      maxCount = count;
      maxEmotion = emotion as EmotionType;
    }
  });

  return maxEmotion;
}

/**
 * 統計をリセット
 */
export function resetVisitorStats(): void {
  saveVisitorStats(createEmptyStats());
}
