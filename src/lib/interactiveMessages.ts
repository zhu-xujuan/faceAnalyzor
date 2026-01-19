/**
 * 表情分析に基づいたインタラクティブなメッセージ生成
 */

import type { EmotionType } from '@/types/emotion';
import type { VisitorStats } from './visitorStats';
import { calculateEmotionPercentages } from './visitorStats';

export interface InteractiveMessage {
  greeting: string;
  mainMessage: string;
  followUp: string;
  suggestion?: string;
}

/**
 * 来場者番号に基づいた挨拶を生成
 */
function generateGreeting(visitorNumber: number): string {
  if (visitorNumber === 1) {
    return '🎉 記念すべき最初のお客様です！';
  } else if (visitorNumber % 100 === 0) {
    return `🎊 祝！${visitorNumber}人目のお客様です！`;
  } else if (visitorNumber % 50 === 0) {
    return `✨ ${visitorNumber}人目のお客様です！`;
  } else if (visitorNumber % 10 === 0) {
    return `👏 ${visitorNumber}人目のお客様、ようこそ！`;
  } else {
    return `🙂 ${visitorNumber}人目のお客様です`;
  }
}

/**
 * 表情別のメッセージパターン
 */
const EMOTION_MESSAGES: Record<EmotionType, InteractiveMessage[]> = {
  happy: [
    {
      greeting: '😊',
      mainMessage: '素晴らしい笑顔ですね！今回の来場は結構満足しているようですね。',
      followUp: '今回の満足度に点数をつけて頂き、ありがとうございます！',
      suggestion: '弊社のサービスに何かご意見がありましたら、お気軽にお聞かせください。',
    },
    {
      greeting: '🌟',
      mainMessage: 'とても嬉しそうなお顔ですね！',
      followUp: 'お客様の笑顔が私たちの励みになります。ありがとうございます！',
      suggestion: 'さらなるサービス向上のため、ご感想をお聞かせ頂けますと幸いです。',
    },
    {
      greeting: '✨',
      mainMessage: '明るい笑顔が印象的です！',
      followUp: '今日は良い一日になりそうですね。ご来場ありがとうございます！',
    },
  ],
  sad: [
    {
      greeting: '😌',
      mainMessage: '少し元気がないように見えますね...',
      followUp: '何か不満やお困りのことはございませんか？',
      suggestion: '弊社のAI技術やサービスで解決できることがあれば、ぜひお手伝いさせてください。',
    },
    {
      greeting: '🤝',
      mainMessage: 'お疲れのようですね。',
      followUp: 'ご不便をおかけしている点がございましたら、お聞かせください。',
      suggestion: '弊社スタッフがサポートいたします。お気軽にお声がけください。',
    },
  ],
  angry: [
    {
      greeting: '🙇',
      mainMessage: 'ご不満な点があったようで、申し訳ございません。',
      followUp: 'どのような点が問題だったか、お聞かせ頂けますでしょうか？',
      suggestion: '弊社のAI技術やサービス改善で解決できるよう、全力で対応させて頂きます。',
    },
    {
      greeting: '💼',
      mainMessage: 'お怒りのご様子、真摯に受け止めます。',
      followUp: '改善すべき点をぜひお教えください。',
      suggestion: '担当者が直接対応させて頂きます。',
    },
  ],
  surprised: [
    {
      greeting: '😲',
      mainMessage: '驚きの表情ですね！',
      followUp: '何か予想外のことがありましたか？',
      suggestion: '良い意味での驚きであれば嬉しいです。弊社のAI技術の可能性を感じて頂けたでしょうか？',
    },
    {
      greeting: '🎁',
      mainMessage: 'びっくりされているようですね！',
      followUp: '新しい発見がありましたか？',
      suggestion: 'もっと面白い機能もございます。ぜひご体験ください！',
    },
  ],
  fearful: [
    {
      greeting: '😊',
      mainMessage: '少し不安そうに見えますね。',
      followUp: 'ご心配な点がございましたら、お気軽にお尋ねください。',
      suggestion: '弊社スタッフが丁寧にご説明させて頂きます。安心してご利用ください。',
    },
    {
      greeting: '🤗',
      mainMessage: '緊張されていますか？',
      followUp: 'リラックスしてお楽しみください。',
      suggestion: '分からないことがあれば、いつでもサポートいたします。',
    },
  ],
  disgusted: [
    {
      greeting: '🙇‍♂️',
      mainMessage: 'ご不快な思いをさせてしまったようで、申し訳ございません。',
      followUp: '改善が必要な点をお聞かせ頂けますか？',
      suggestion: '弊社のサービス品質向上のため、貴重なご意見をお待ちしております。',
    },
  ],
  neutral: [
    {
      greeting: '😐',
      mainMessage: '落ち着いた様子ですね。',
      followUp: 'ごゆっくりご覧ください。',
      suggestion: '何かご質問があれば、お気軽にお声がけください。',
    },
    {
      greeting: '📋',
      mainMessage: '冷静に観察されているようですね。',
      followUp: '弊社のサービスについて、率直なご意見をお聞かせ頂けると幸いです。',
    },
  ],
  satisfied: [
    {
      greeting: '😌',
      mainMessage: '満足されているご様子ですね！',
      followUp: '今回の体験にご満足いただけたようで嬉しいです。',
      suggestion: 'ご満足いただけた点を、ぜひ周りの方にもお伝えください。',
    },
    {
      greeting: '✨',
      mainMessage: 'とても満足そうなお顔ですね。',
      followUp: '弊社のサービスがお役に立てたようで何よりです。',
      suggestion: 'さらなるサービス向上のため、何が良かったかお聞かせください。',
    },
    {
      greeting: '🎯',
      mainMessage: '期待に応えられたようですね！',
      followUp: 'ご満足いただけて光栄です。',
      suggestion: '他にもご興味のあるサービスがございましたら、お気軽にお試しください。',
    },
  ],
  understanding: [
    {
      greeting: '🤔',
      mainMessage: 'なるほど、という表情ですね！',
      followUp: '何か新しい発見や理解があったようですね。',
      suggestion: '弊社の技術や仕組みについて、もっと詳しく知りたいことがあればお聞かせください。',
    },
    {
      greeting: '💡',
      mainMessage: '理解が深まったようですね。',
      followUp: '弊社のサービスについて納得いただけましたか？',
      suggestion: 'さらに詳しい情報やデモをご希望でしたら、お気軽にお声がけください。',
    },
    {
      greeting: '📚',
      mainMessage: '納得されているようですね！',
      followUp: '仕組みや技術について理解を深めていただけたようで嬉しいです。',
      suggestion: '実際の活用事例なども豊富にございます。ぜひご覧ください。',
    },
  ],
  intrigued: [
    {
      greeting: '🤨',
      mainMessage: '面白そう、という表情ですね！',
      followUp: '弊社のサービスに興味を持っていただけたようですね。',
      suggestion: 'もっと詳しく知りたい点があれば、ぜひお気軽にご質問ください。',
    },
    {
      greeting: '🔍',
      mainMessage: '興味津々のご様子ですね。',
      followUp: '何か特に気になる機能や技術はありましたか？',
      suggestion: '実際に体験できるデモもございます。ぜひお試しください！',
    },
    {
      greeting: '⚡',
      mainMessage: 'ワクワクされているようですね！',
      followUp: '新しい可能性を感じていただけましたか？',
      suggestion: 'さらに面白い機能もたくさんあります。スタッフがご案内いたします。',
    },
  ],
  confused: [
    {
      greeting: '😕',
      mainMessage: '戸惑われているようですね。',
      followUp: '分かりにくい点がございましたか？',
      suggestion: 'スタッフが丁寧にご説明いたします。どんな小さなことでもお気軽にお尋ねください。',
    },
    {
      greeting: '🤷',
      mainMessage: 'よく分からない、という表情ですね。',
      followUp: 'ご不明な点をクリアにさせてください。',
      suggestion: '分かりやすい資料や実演もご用意しております。ご遠慮なくお声がけください。',
    },
    {
      greeting: '💭',
      mainMessage: '混乱されているようですね。',
      followUp: '複雑に感じられる部分がありましたか？',
      suggestion: '一つずつ丁寧にご説明いたします。理解を深めていただけるようサポートさせてください。',
    },
  ],
};

/**
 * ランダムにメッセージパターンを選択
 */
function selectRandomMessage(emotion: EmotionType): InteractiveMessage {
  const messages = EMOTION_MESSAGES[emotion];
  const index = Math.floor(Math.random() * messages.length);
  return messages[index];
}

/**
 * 統計情報に基づいた追加メッセージを生成
 */
function generateStatsMessage(stats: VisitorStats, currentEmotion: EmotionType): string {
  const percentages = calculateEmotionPercentages(stats);
  const total = stats.totalVisitors;

  if (total < 5) {
    return 'まだデータが少ないですが、引き続き分析を続けます。';
  }

  const emotionNames: Record<EmotionType, string> = {
    happy: '嬉しい',
    sad: '悲しい',
    angry: '怒り',
    surprised: '驚き',
    fearful: '不安',
    disgusted: '不快',
    neutral: '普通',
    satisfied: '満足',
    understanding: 'なるほど',
    intrigued: '面白そう',
    confused: '戸惑い',
  };

  // 最も多い表情を見つける
  let maxEmotion: EmotionType = 'neutral';
  let maxPercentage = 0;

  Object.entries(percentages).forEach(([emotion, percentage]) => {
    if (percentage > maxPercentage) {
      maxPercentage = percentage;
      maxEmotion = emotion as EmotionType;
    }
  });

  const messages: string[] = [];

  // 現在の表情と統計を比較
  if (currentEmotion === maxEmotion) {
    messages.push(
      `現在、来場者の${maxPercentage}%が「${emotionNames[maxEmotion]}」の表情を示しています。`
    );
  } else {
    messages.push(
      `これまでの来場者では「${emotionNames[maxEmotion]}」の表情が最も多く（${maxPercentage}%）、` +
      `あなたは「${emotionNames[currentEmotion]}」です。`
    );
  }

  // ポジティブな表情が多い場合
  const positivePercentage = percentages.happy + percentages.surprised + percentages.satisfied + percentages.intrigued;
  if (positivePercentage > 60) {
    messages.push(`${positivePercentage}%の来場者がポジティブな印象を持たれています！`);
  }

  // ネガティブな表情が多い場合
  const negativePercentage = percentages.sad + percentages.angry + percentages.disgusted;
  if (negativePercentage > 30) {
    messages.push(`改善が必要な点があるかもしれません。${negativePercentage}%の方が不満を感じている可能性があります。`);
  }

  return messages.join(' ');
}

/**
 * 完全なインタラクティブメッセージを生成
 */
export function generateInteractiveMessage(
  emotion: EmotionType,
  visitorNumber: number,
  stats: VisitorStats
): {
  greeting: string;
  visitorInfo: string;
  emotionMessage: InteractiveMessage;
  statsMessage: string;
} {
  return {
    greeting: generateGreeting(visitorNumber),
    visitorInfo: `来場者番号: ${visitorNumber}`,
    emotionMessage: selectRandomMessage(emotion),
    statsMessage: generateStatsMessage(stats, emotion),
  };
}
