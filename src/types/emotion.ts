/**
 * 表情分析の型定義
 */

export type EmotionType =
  | 'happy'
  | 'sad'
  | 'angry'
  | 'surprised'
  | 'fearful'
  | 'disgusted'
  | 'neutral'
  | 'satisfied'
  | 'understanding'
  | 'intrigued'
  | 'confused';

export interface EmotionData {
  ja: string;
  icon: string;
  color: string;
  description: string;
}

export type EmotionMap = Record<EmotionType, EmotionData>;

export interface EmotionResult {
  emotion: EmotionType;
  confidence: number;
  allScores: Record<EmotionType, number>;
}

export interface FaceAnalysisRequest {
  imageData: string; // base64 encoded image
}

export interface FaceAnalysisResponse {
  ok: boolean;
  error?: string;
  result?: EmotionResult;
  faceDetected?: boolean;
}

/**
 * 表情データの定義
 */
export const EMOTIONS: EmotionMap = {
  happy: {
    ja: '笑顔',
    icon: '😊',
    color: '#FFD93D',
    description: '相手は嬉しそうです'
  },
  sad: {
    ja: '悲しみ',
    icon: '😢',
    color: '#6BCB77',
    description: '相手は悲しそうです'
  },
  angry: {
    ja: '怒り',
    icon: '😠',
    color: '#FF6B6B',
    description: '相手は怒っているようです'
  },
  surprised: {
    ja: '驚き',
    icon: '😲',
    color: '#4D96FF',
    description: '相手は驚いています'
  },
  fearful: {
    ja: '恐れ',
    icon: '😨',
    color: '#9B59B6',
    description: '相手は不安そうです'
  },
  disgusted: {
    ja: '嫌悪',
    icon: '🤢',
    color: '#1ABC9C',
    description: '相手は不快そうです'
  },
  neutral: {
    ja: '普通',
    icon: '😐',
    color: '#95A5A6',
    description: '相手は落ち着いています'
  },
  satisfied: {
    ja: '満足',
    icon: '😌',
    color: '#F39C12',
    description: '相手は満足しています'
  },
  understanding: {
    ja: 'なるほど',
    icon: '🤔',
    color: '#3498DB',
    description: '相手は理解・納得しています'
  },
  intrigued: {
    ja: '面白そう',
    icon: '🤨',
    color: '#E74C3C',
    description: '相手は興味を持っています'
  },
  confused: {
    ja: '戸惑い',
    icon: '😕',
    color: '#FFA07A',
    description: '相手は戸惑っています'
  },
};
