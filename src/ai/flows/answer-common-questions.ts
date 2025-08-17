
'use server';

/**
 * @fileOverview A flow that uses an AI to answer common questions from members.
 *
 * - answerCommonQuestion - A function that handles the question answering process.
 * - AnswerCommonQuestionInput - The input type for the answerCommonQuestion function.
 * - AnswerCommonQuestionOutput - The return type for the answerCommonQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerCommonQuestionInputSchema = z.object({
  question: z.string().describe('The question asked by the member.'),
});
export type AnswerCommonQuestionInput = z.infer<typeof AnswerCommonQuestionInputSchema>;

const AnswerCommonQuestionOutputSchema = z.object({
  answer: z.string().describe('The answer to the question.'),
});
export type AnswerCommonQuestionOutput = z.infer<typeof AnswerCommonQuestionOutputSchema>;

const prompt = ai.definePrompt({
  name: 'answerCommonQuestionPrompt',
  input: {schema: AnswerCommonQuestionInputSchema},
  output: {schema: AnswerCommonQuestionOutputSchema},
  prompt: `You are an AI support assistant for Amulya Digital, an organization for digital creators.

  Answer the following question to the best of your ability using your knowledge base.
  If you do not know the answer, please state that you do not know.

  Question: {{{question}}} `,
});


export async function answerCommonQuestion(input: AnswerCommonQuestionInput): Promise<AnswerCommonQuestionOutput> {
    const {output} = await prompt(input);
    return output!;
}
