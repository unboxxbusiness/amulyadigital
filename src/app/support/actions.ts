'use server';

import { answerCommonQuestion } from '@/ai/flows/answer-common-questions';
import type { AnswerCommonQuestionInput } from '@/ai/flows/answer-common-questions';

export async function answerQuestionAction(input: AnswerCommonQuestionInput) {
  try {
    const output = await answerCommonQuestion(input);
    return { answer: output.answer };
  } catch (error) {
    console.error('Error in AI action:', error);
    return { error: 'An error occurred while getting an answer.' };
  }
}
