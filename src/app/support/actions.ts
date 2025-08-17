'use server';

import { offerChat } from '@/ai/flows/offer-chat';
import type { OfferChatInput } from '@/ai/flows/offer-chat';

export async function offerChatAction(input: OfferChatInput) {
  try {
    const output = await offerChat(input);
    return { answer: output.answer };
  } catch (error) {
    console.error('Error in AI action:', error);
    return { error: 'An error occurred while getting an answer.' };
  }
}
