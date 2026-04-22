import Groq from 'groq-sdk';
import { config } from '../config';
import { logger } from '../logger';

export interface AnalysisResult {
  translation: string;
  grammar: {
    structure: string;
    tense: string;
    explanation: string;
    highlights: Array<{
      text: string;
      role: string;
      explanation: string;
    }>;
  };
  vocabulary: Array<{
    word: string;
    meaning: string;
    pronunciation: string;
    partOfSpeech: string;
    examples: string[];
    synonyms: string[];
    level: string;
  }>;
  context: string;
  similarSentences: string[];
}

const groq = new Groq({ apiKey: config.groq.apiKey });

const ANALYSIS_PROMPT = (sentence: string) => `
Bạn là chuyên gia ngôn ngữ tiếng Anh. Hãy phân tích câu sau cho người học Việt Nam.

Câu cần phân tích: "${sentence}"

Yêu cầu trả về JSON có cấu trúc sau (KHÔNG thêm bất kỳ giải thích nào ngoài JSON):
{
  "translation": "bản dịch tiếng Việt tự nhiên",
  "grammar": {
    "structure": "cấu trúc ngữ pháp",
    "tense": "thì của câu",
    "explanation": "giải thích ngữ pháp",
    "highlights": [{"text": "...", "role": "...", "explanation": "..."}]
  },
  "vocabulary": [
    {
      "word": "...",
      "meaning": "...",
      "pronunciation": "...",
      "partOfSpeech": "...",
      "examples": ["ví dụ 1", "ví dụ 2"],
      "synonyms": ["từ đồng nghĩa"],
      "level": "A1-C2"
    }
  ],
  "context": "giải thích ngữ cảnh",
  "similarSentences": ["câu 1", "câu 2", "câu 3"]
}
`;

export async function analyzeSentenceWithAI(sentence: string): Promise<AnalysisResult> {
  if (!config.groq.apiKey) throw new Error('Groq API Key missing');

  try {
    const response = await groq.chat.completions.create({
      messages: [{ role: 'user', content: ANALYSIS_PROMPT(sentence) }],
      model: config.groq.model,
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    const text = response.choices[0]?.message?.content || '{}';
    return JSON.parse(text) as AnalysisResult;
  } catch (err) {
    logger.error('AI analysis failed with Groq', { error: (err as Error).message });
    throw new Error('Failed to analyze sentence with AI');
  }
}
