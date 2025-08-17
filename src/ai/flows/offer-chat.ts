
'use server';

/**
 * @fileOverview A flow that uses an AI to answer questions about offers.
 */

import {ai} from '@/ai/genkit';
import {adminDb} from '@/lib/firebase/admin-app';
import {z} from 'genkit';
import { gemini15Flash } from 'genkit/models';

const OfferChatInputSchema = z.object({
  history: z.array(z.object({role: z.string(), content: z.string()})).describe('The chat history.'),
});
export type OfferChatInput = z.infer<typeof OfferChatInputSchema>;

const OfferChatOutputSchema = z.object({
  answer: z.string().describe('The answer to the question.'),
});
export type OfferChatOutput = z.infer<typeof OfferChatOutputSchema>;

async function getOffers() {
    const offersSnapshot = await adminDb.collection('offers').orderBy('createdAt', 'desc').get();
    if (offersSnapshot.empty) {
        return 'No offers are available at the moment.';
    }
    return offersSnapshot.docs.map(doc => {
        const data = doc.data();
        return `- ${data.title}: ${data.description}`;
    }).join('\n');
}

const prompt = ai.definePrompt({
  name: 'offerChatPrompt',
  input: {schema: z.object({
    history: z.array(z.object({role: z.string(), content: z.string()})),
    offers: z.string(),
  })},
  output: {schema: OfferChatOutputSchema},
  prompt: `You are a helpful AI assistant for Amulya Digital, an organization for digital creators. Your role is to answer member questions about the exclusive offers available to them.

  Here is a list of the current offers:
  {{{offers}}}

  Use the provided list of offers to answer the user's questions. Be friendly and conversational.
  If the user asks about something unrelated to the offers, politely steer the conversation back to the available offers or let them know you can only help with offer-related questions.
  `,
  model: gemini15Flash,
  history: z.array(z.object({role: z.string(), content: z.string()})),
});

const offerChatFlow = ai.defineFlow(
  {
    name: 'offerChatFlow',
    inputSchema: OfferChatInputSchema,
    outputSchema: OfferChatOutputSchema,
  },
  async (input) => {
    const offers = await getOffers();
    const { output } = await prompt({ ...input, offers });
    return output!;
  }
);


export async function offerChat(input: OfferChatInput): Promise<OfferChatOutput> {
  return await offerChatFlow(input);
}
