import Groq from 'groq-sdk';
import { config } from '../../core/config';
import { logger } from '../../core/logger';

const groq = new Groq({ apiKey: config.groq.apiKey });

export async function quickTranslate(text: string): Promise<string> {
  if (!config.groq.apiKey) {
    logger.warn('Groq API Key missing, skipping translation');
    return '';
  }

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: `Dịch đoạn văn tiếng Anh sau sang tiếng Việt tự nhiên, chỉ trả về bản dịch, không giải thích:\n"${text}"`,
        },
      ],
      model: config.groq.model,
      temperature: 0.1,
    });

    return chatCompletion.choices[0]?.message?.content?.trim() || '';
  } catch (err) {
    logger.error('Quick translate failed with Groq', { error: (err as Error).message });
    return '';
  }
}
