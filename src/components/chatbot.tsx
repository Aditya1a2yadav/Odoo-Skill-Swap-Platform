
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { MessageSquare, Send, X, Loader2, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { chat, ChatInput } from '@/ai/flows/chatbot';
import { AnimatePresence, motion } from 'framer-motion';

type Message = {
    role: 'user' | 'model';
    content: string;
};

export function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{ role: 'model', content: "Hi! I'm SwapBot. How can I help you today?"}]);
        }
    }, [isOpen, messages]);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: Message = { role: 'user', content: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const chatInput: ChatInput = {
                history: messages, // Pass the history before the new user message
                message: input,
            };
            const response = await chat(chatInput);
            const botMessage: Message = { role: 'model', content: response };
            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error('Chatbot error:', error);
            const errorMessage: Message = { role: 'model', content: 'Sorry, I ran into an error. Please try again.' };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="fixed bottom-24 right-5 z-50 w-full max-w-sm"
                    >
                        <Card className="h-[60vh] flex flex-col bg-slate-900 text-slate-50 border-slate-700 shadow-2xl shadow-black/50">
                            <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-slate-700">
                                <div className="flex items-center gap-3">
                                    <Bot className="h-7 w-7 text-primary" />
                                    <h3 className="text-lg font-bold">SwapBot Assistant</h3>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 text-slate-400 hover:bg-slate-800 hover:text-slate-200">
                                    <X className="h-5 w-5" />
                                </Button>
                            </CardHeader>
                            <CardContent className="flex-1 p-4 overflow-y-auto" ref={scrollAreaRef}>
                                <div className="space-y-4">
                                    {messages.map((message, index) => (
                                        <div key={index} className={cn('flex items-end gap-2', message.role === 'user' ? 'justify-end' : 'justify-start')}>
                                            {message.role === 'model' && <Bot className="h-6 w-6 text-primary flex-shrink-0" />}
                                            <div className={cn(
                                                'max-w-[80%] rounded-2xl px-4 py-2 text-sm',
                                                message.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none'
                                            )}>
                                                <p>{message.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {isLoading && (
                                         <div className="flex items-end gap-2 justify-start">
                                            <Bot className="h-6 w-6 text-primary flex-shrink-0" />
                                            <div className="max-w-[80%] rounded-2xl px-4 py-2 text-sm bg-slate-800 text-slate-200 rounded-bl-none">
                                                <Loader2 className="h-5 w-5 animate-spin"/>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="p-4 border-t border-slate-700">
                                <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex w-full items-center gap-2">
                                    <Input
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Ask me anything..."
                                        className="bg-slate-800 border-slate-700 focus-visible:ring-primary focus-visible:ring-offset-slate-900"
                                        disabled={isLoading}
                                    />
                                    <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                                        <Send className="h-5 w-5" />
                                    </Button>
                                </form>
                            </CardFooter>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <Button
                size="icon"
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "fixed bottom-5 right-5 z-50 h-14 w-14 rounded-full shadow-lg transition-transform hover:scale-110",
                    isOpen && "scale-0 opacity-0"
                )}
            >
                <MessageSquare className="h-7 w-7" />
            </Button>
        </>
    );
}
