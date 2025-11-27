'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    MessageCircle,
    X,
    Send,
    Loader2,
    Minimize2,
    Maximize2,
    Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { chatWithAI, getInitialGreeting } from '@/actions/ai/suggestions';

type Message = {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
};

type UserContext = {
    name: string;
    followers: number;
    totalDMs: number;
    totalReplies: number;
    automationCount: number;
    avgEngagement: number;
    automations: Array<{
        name: string;
        dmsSent: number;
        commentsReplied: number;
        engagementPercent: number;
    }>;
};

type Props = {
    userContext: UserContext;
};

export function AIChatbotWidget({ userContext }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            // Load initial greeting
            setIsLoading(true);
            getInitialGreeting(userContext).then((greeting) => {
                setMessages([
                    {
                        role: 'assistant',
                        content: greeting,
                        timestamp: new Date(),
                    },
                ]);
                setIsLoading(false);
            });
        }
    }, [isOpen, userContext]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            role: 'user',
            content: input,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const conversationHistory = messages.map((m) => ({
                role: m.role,
                content: m.content,
            }));

            const response = await chatWithAI(input, userContext, conversationHistory);

            const assistantMessage: Message = {
                role: 'assistant',
                content: response.response,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Chat error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 group"
            >
                <div className="relative">
                    <div className="absolute inset-0 bg-primary rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />
                    <div className="relative flex items-center gap-2 px-5 py-3 bg-primary rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105">
                        <MessageCircle className="w-5 h-5 text-primary-foreground" />
                        <span className="text-primary-foreground font-medium">AI Assistant</span>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background animate-pulse" />
                    </div>
                </div>
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 w-[400px]">
            <Card className="shadow-2xl border bg-background/95 backdrop-blur-sm">
                <CardHeader className="pb-3 border-b">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <Sparkles className="w-5 h-5 text-primary" />
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-semibold">AI Assistant</CardTitle>
                                <p className="text-xs text-muted-foreground">Always here to help</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setIsMinimized(!isMinimized)}
                            >
                                {isMinimized ? (
                                    <Maximize2 className="h-4 w-4" />
                                ) : (
                                    <Minimize2 className="h-4 w-4" />
                                )}
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setIsOpen(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                {!isMinimized && (
                    <>
                        <CardContent className="p-0">
                            {/* Messages */}
                            <div className="h-[400px] overflow-y-auto p-4 space-y-4">
                                {messages.map((message, index) => (
                                    <div
                                        key={index}
                                        className={cn(
                                            'flex',
                                            message.role === 'user' ? 'justify-end' : 'justify-start'
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm',
                                                message.role === 'user'
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-muted'
                                            )}
                                        >
                                            <p className="whitespace-pre-wrap">{message.content}</p>
                                            <span className="text-xs opacity-60 mt-1 block">
                                                {message.timestamp.toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-muted rounded-2xl px-4 py-2.5">
                                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <div className="p-4 border-t bg-muted/30">
                                <div className="flex items-center gap-2">
                                    <Input
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSend();
                                            }
                                        }}
                                        placeholder="Ask me anything..."
                                        className="flex-1 bg-background"
                                        disabled={isLoading}
                                    />
                                    <Button
                                        size="icon"
                                        onClick={handleSend}
                                        disabled={!input.trim() || isLoading}
                                        className="shrink-0"
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2 text-center">
                                    Powered by GPT-4 • Knows your analytics
                                </p>
                            </div>
                        </CardContent>
                    </>
                )}
            </Card>
        </div>
    );
}
