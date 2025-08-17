
'use server';

import { offerChat as offerChatFlow, type OfferChatInput, type OfferChatOutput } from "@/ai/flows/offer-chat";

export async function offerChat(input: OfferChatInput): Promise<OfferChatOutput | { error: string }> {
    try {
        const result = await offerChatFlow(input);
        return result;
    } catch (error) {
        console.error('Error in AI action:', error);
        return { error: 'An error occurred while getting an answer.' };
    }
}
