'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Loader, Send, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { offerChatAction } from './actions';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function SupportPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const chatHistory = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        content: msg.content
      }));
      chatHistory.push({ role: 'user', content: input });


      const result = await offerChatAction({ history: chatHistory.map(h => ({role: h.role, content: h.content})) });

      if (result.error) {
        throw new Error(result.error);
      }
      
      const assistantMessage: Message = { role: 'assistant', content: result.answer ?? 'Sorry, I could not find an answer.' };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Failed to get an answer. Please try again.",
      });
      // Optionally remove the user message if the API call fails
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">AI Offer Assistant</h1>
        <p className="text-muted-foreground">Ask me anything about the exclusive member offers.</p>
      </div>

      <Card className="flex flex-col h-[70vh]">
        <CardHeader>
          <CardTitle>Chat</CardTitle>
          <CardDescription>
            This is a chat with an AI assistant. It can answer questions about our offers.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <ScrollArea className="h-full" ref={scrollAreaRef}>
             <div className="space-y-4 pr-4">
              {messages.length === 0 && (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              )}
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-start gap-3",
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                     <div className="p-2 bg-secondary text-secondary-foreground rounded-full">
                       <Bot className="size-5" />
                    </div>
                  )}
                   <div className={cn(
                      "p-3 rounded-lg max-w-sm",
                      message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                   )}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                   {message.role === 'user' && (
                     <div className="p-2 bg-secondary text-secondary-foreground rounded-full">
                       <User className="size-5" />
                    </div>
                  )}
                </div>
              ))}
               {isLoading && (
                <div className="flex items-start gap-3">
                   <div className="p-2 bg-secondary text-secondary-foreground rounded-full">
                     <Bot className="size-5" />
                  </div>
                  <div className="p-3 rounded-lg bg-secondary">
                      <Loader className="size-5 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="pt-4 border-t">
          <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
            <Textarea
              placeholder="Type your message here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as any);
                }
              }}
              disabled={isLoading}
              className="min-h-0 resize-none"
              rows={1}
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
