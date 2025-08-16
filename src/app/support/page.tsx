"use client";

import { useState } from 'react';
import { Bot, Loader, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { answerQuestionAction } from './actions';

export default function SupportPage() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);
    setAnswer('');

    try {
      const result = await answerQuestionAction({ question });
      if (result.error) {
        throw new Error(result.error);
      }
      setAnswer(result.answer ?? 'No answer was returned.');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Failed to get an answer from the AI assistant. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-headline">AI Support Assistant</h1>
        <p className="text-muted-foreground">Get instant answers to common questions about Amulya Digital.</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Ask a Question</CardTitle>
            <CardDescription>
              Enter your question below to search our knowledge base. The AI assistant will provide an answer based on our frequently asked questions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="e.g., How do I update my payment information?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={isLoading}
              rows={3}
            />
            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader className="size-4 animate-spin" />
                <span>Thinking...</span>
              </div>
            )}
            {answer && !isLoading && (
              <div className="p-4 bg-secondary rounded-lg space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-accent text-accent-foreground rounded-full">
                     <Bot className="size-5" />
                  </div>
                  <div className="prose prose-sm max-w-none pt-1">
                    <p className="font-semibold">Answer:</p>
                    <p>{answer}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading || !question.trim()}>
              {isLoading ? 'Getting Answer...' : 'Ask Question'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
