/**
 * 音声合成（Text-to-Speech）のユーティリティ
 */

export interface SpeechOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export class SpeechService {
  private static instance: SpeechService | null = null;

  private constructor() {}

  static getInstance(): SpeechService {
    if (!SpeechService.instance) {
      SpeechService.instance = new SpeechService();
    }
    return SpeechService.instance;
  }

  /**
   * テキストを音声で読み上げる
   * @param text - 読み上げるテキスト
   * @param options - 音声オプション
   */
  speak(text: string, options: SpeechOptions = {}): void {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser');
      return;
    }

    // 既存の読み上げを停止
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = options.lang || 'ja-JP';
    utterance.rate = options.rate || 1.0;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume !== undefined ? options.volume : 1.0;

    window.speechSynthesis.speak(utterance);
  }

  /**
   * 読み上げを停止
   */
  cancel(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  /**
   * 読み上げを一時停止
   */
  pause(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.pause();
    }
  }

  /**
   * 読み上げを再開
   */
  resume(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.resume();
    }
  }

  /**
   * 現在読み上げ中かチェック
   */
  isSpeaking(): boolean {
    if ('speechSynthesis' in window) {
      return window.speechSynthesis.speaking;
    }
    return false;
  }
}

// シングルトンインスタンスをエクスポート
export const speechService = SpeechService.getInstance();

/**
 * 簡易ヘルパー関数
 */
export function speak(text: string, rate: number = 1.0): void {
  speechService.speak(text, { rate });
}
