/**
 * クライアントサイドでface-api.jsを使って表情分析を行うユーティリティ
 */

import type { EmotionResult, EmotionType } from '@/types/emotion';

// face-api.jsの型定義
declare global {
  interface Window {
    faceapi?: {
      nets: {
        tinyFaceDetector: {
          loadFromUri: (uri: string) => Promise<void>;
        };
        ssdMobilenetv1: {
          loadFromUri: (uri: string) => Promise<void>;
        };
        faceExpressionNet: {
          loadFromUri: (uri: string) => Promise<void>;
        };
        faceLandmark68Net: {
          loadFromUri: (uri: string) => Promise<void>;
        };
      };
      TinyFaceDetectorOptions: new (options?: { inputSize?: number; scoreThreshold?: number }) => unknown;
      SsdMobilenetv1Options: new (options?: { minConfidence?: number }) => unknown;
      detectSingleFace: (
        input: HTMLImageElement | HTMLCanvasElement,
        options: unknown
      ) => {
        withFaceExpressions: () => Promise<{
          expressions: Record<string, number>;
        } | undefined>;
        withFaceLandmarks: () => {
          withFaceExpressions: () => Promise<{
            expressions: Record<string, number>;
          } | undefined>;
        };
      };
    };
  }
}

export class EmotionAnalyzer {
  private static instance: EmotionAnalyzer | null = null;
  private isLoaded = false;
  private isLoading = false;
  private loadPromise: Promise<void> | null = null;
  private useHighAccuracy = true; // 高精度モードを使用

  private constructor() {}

  static getInstance(): EmotionAnalyzer {
    if (!EmotionAnalyzer.instance) {
      EmotionAnalyzer.instance = new EmotionAnalyzer();
    }
    return EmotionAnalyzer.instance;
  }

  /**
   * face-api.jsのライブラリとモデルを読み込む
   */
  async loadModels(): Promise<void> {
    if (this.isLoaded) return;
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = this._loadModels();
    return this.loadPromise;
  }

  private async _loadModels(): Promise<void> {
    if (this.isLoading) return;
    this.isLoading = true;

    try {
      // face-api.jsのスクリプトを読み込む
      if (!window.faceapi) {
        await this.loadScript(
          'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js'
        );
      }

      if (!window.faceapi) {
        throw new Error('face-api.js failed to load');
      }

      // モデルファイルを読み込む
      const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';

      if (this.useHighAccuracy) {
        // 高精度モード: SsdMobilenetv1 + ランドマーク検出 + 表情認識
        await Promise.all([
          window.faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          window.faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          window.faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
      } else {
        // 軽量モード: TinyFaceDetector + 表情認識
        await Promise.all([
          window.faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          window.faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
      }

      this.isLoaded = true;
    } catch (error) {
      this.isLoading = false;
      this.loadPromise = null;
      throw error;
    }
  }

  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  }

  /**
   * 画像の前処理を行う（明るさとコントラストの調整）
   */
  private preprocessImage(imageElement: HTMLImageElement | HTMLCanvasElement): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');

    canvas.width = imageElement.width;
    canvas.height = imageElement.height;

    // 画像を描画
    ctx.drawImage(imageElement, 0, 0);

    // 明るさとコントラストを調整
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const contrast = 1.1; // コントラスト調整
    const brightness = 10; // 明るさ調整

    for (let i = 0; i < data.length; i += 4) {
      // RGB各チャンネルに調整を適用
      data[i] = Math.min(255, Math.max(0, contrast * (data[i] - 128) + 128 + brightness));
      data[i + 1] = Math.min(255, Math.max(0, contrast * (data[i + 1] - 128) + 128 + brightness));
      data[i + 2] = Math.min(255, Math.max(0, contrast * (data[i + 2] - 128) + 128 + brightness));
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
  }

  /**
   * 画像から表情を分析する
   * @param imageElement - 分析対象の画像要素またはCanvas
   * @returns 分析結果
   */
  async analyzeEmotion(
    imageElement: HTMLImageElement | HTMLCanvasElement
  ): Promise<EmotionResult | null> {
    if (!this.isLoaded) {
      await this.loadModels();
    }

    if (!window.faceapi) {
      throw new Error('face-api.js is not loaded');
    }

    try {
      // 画像の前処理
      const processedImage = this.preprocessImage(imageElement);

      let detection;
      if (this.useHighAccuracy) {
        // 高精度モード: SsdMobilenetv1 + ランドマーク + 表情認識
        detection = await window.faceapi
          .detectSingleFace(processedImage, new window.faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }))
          .withFaceLandmarks()
          .withFaceExpressions();
      } else {
        // 軽量モード: TinyFaceDetector + 表情認識
        detection = await window.faceapi
          .detectSingleFace(processedImage, new window.faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.5 }))
          .withFaceExpressions();
      }

      if (!detection) {
        return null; // 顔が検出されなかった
      }

      const expressions = detection.expressions;

      // 最も強い感情を特定
      let maxEmotion: EmotionType = 'neutral';
      let maxValue = 0;

      const emotionMapping: Record<string, EmotionType> = {
        happy: 'happy',
        sad: 'sad',
        angry: 'angry',
        surprised: 'surprised',
        fearful: 'fearful',
        disgusted: 'disgusted',
        neutral: 'neutral',
      };

      Object.entries(expressions).forEach(([key, value]) => {
        if (value > maxValue && emotionMapping[key]) {
          maxValue = value;
          maxEmotion = emotionMapping[key];
        }
      });

      // すべてのスコアを変換
      const baseScores = {
        happy: expressions.happy || 0,
        sad: expressions.sad || 0,
        angry: expressions.angry || 0,
        surprised: expressions.surprised || 0,
        fearful: expressions.fearful || 0,
        disgusted: expressions.disgusted || 0,
        neutral: expressions.neutral || 0,
      };

      // 複合感情を計算（より厳密な条件で判定）
      const MIN_THRESHOLD = 0.15; // 複合感情を検出するための最小閾値

      // 満足: 幸せ + 落ち着き（両方がある程度必要）
      const satisfiedScore = (baseScores.happy > MIN_THRESHOLD && baseScores.neutral > MIN_THRESHOLD)
        ? Math.min(baseScores.happy * 0.65 + baseScores.neutral * 0.35, 1)
        : 0;

      // なるほど: 驚き + 落ち着き（理解と納得の混合）
      const understandingScore = (baseScores.surprised > MIN_THRESHOLD && baseScores.neutral > MIN_THRESHOLD)
        ? Math.min(baseScores.surprised * 0.45 + baseScores.neutral * 0.55, 1)
        : 0;

      // 面白そう: 驚き + 喜び（興味と好奇心）
      const intriguedScore = (baseScores.surprised > MIN_THRESHOLD && baseScores.happy > MIN_THRESHOLD)
        ? Math.min(baseScores.surprised * 0.55 + baseScores.happy * 0.45, 1)
        : 0;

      // 戸惑い: 驚き + 不安（混乱と困惑）
      const confusedScore = (baseScores.surprised > MIN_THRESHOLD && baseScores.fearful > MIN_THRESHOLD)
        ? Math.min(baseScores.surprised * 0.5 + baseScores.fearful * 0.5, 1)
        : 0;

      const allScores: Record<EmotionType, number> = {
        ...baseScores,
        satisfied: satisfiedScore,
        understanding: understandingScore,
        intrigued: intriguedScore,
        confused: confusedScore,
      };

      // 複合感情も含めて最も強い感情を再計算
      let finalEmotion: EmotionType = maxEmotion;
      let finalValue = maxValue;

      // 複合感情のチェック（閾値を超えている場合のみ）
      const COMPOSITE_MIN = 0.25; // 複合感情として認識する最小スコア

      if (satisfiedScore > COMPOSITE_MIN && satisfiedScore > finalValue) {
        finalEmotion = 'satisfied';
        finalValue = satisfiedScore;
      }
      if (understandingScore > COMPOSITE_MIN && understandingScore > finalValue) {
        finalEmotion = 'understanding';
        finalValue = understandingScore;
      }
      if (intriguedScore > COMPOSITE_MIN && intriguedScore > finalValue) {
        finalEmotion = 'intrigued';
        finalValue = intriguedScore;
      }
      if (confusedScore > COMPOSITE_MIN && confusedScore > finalValue) {
        finalEmotion = 'confused';
        finalValue = confusedScore;
      }

      return {
        emotion: finalEmotion,
        confidence: Math.round(finalValue * 100),
        allScores,
      };
    } catch (error) {
      console.error('Emotion analysis failed:', error);
      throw error;
    }
  }

  /**
   * base64画像データから表情を分析する
   * @param base64Image - base64エンコードされた画像データ
   * @returns 分析結果
   */
  async analyzeEmotionFromBase64(base64Image: string): Promise<EmotionResult | null> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = async () => {
        try {
          const result = await this.analyzeEmotion(img);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = base64Image;
    });
  }

  /**
   * モデルが読み込まれているかチェック
   */
  isModelLoaded(): boolean {
    return this.isLoaded;
  }

  /**
   * 精度モードを設定
   * @param useHighAccuracy - true: 高精度モード（遅い）, false: 高速モード（精度低い）
   */
  setAccuracyMode(useHighAccuracy: boolean): void {
    if (this.useHighAccuracy !== useHighAccuracy) {
      this.useHighAccuracy = useHighAccuracy;
      // モデル再読み込みが必要
      this.isLoaded = false;
      this.isLoading = false;
      this.loadPromise = null;
    }
  }

  /**
   * 現在の精度モードを取得
   */
  getAccuracyMode(): boolean {
    return this.useHighAccuracy;
  }
}

// シングルトンインスタンスをエクスポート
export const emotionAnalyzer = EmotionAnalyzer.getInstance();
