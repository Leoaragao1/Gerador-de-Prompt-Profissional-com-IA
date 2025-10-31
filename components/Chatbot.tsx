
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { Send, Loader, Bot } from 'lucide-react';
import Markdown from 'react-markdown';

interface Message {
    role: 'user' | 'model';
    text: string;
}

const Chatbot: React.FC = () => {
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const initializeChat = useCallback(() => {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const newChat = ai.chats.create({
                model: 'gemini-2.5-flash',
            });
            setChat(newChat);
        } catch (error) {
            console.error("Failed to initialize chat:", error);
            setMessages([{ role: 'model', text: 'Erro ao iniciar o chat. Verifique a chave de API.' }]);
        }
    }, []);

    useEffect(() => {
        initializeChat();
    }, [initializeChat]);

    const handleSend = async () => {
        if (!input.trim() || !chat || isLoading) return;

        const userMessage: Message = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await chat.sendMessage({ message: input });
            const modelMessage: Message = { role: 'model', text: response.text };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error("Error sending message:", error);
            const errorMessage: Message = { role: 'model', text: 'Desculpe, ocorreu um erro ao obter uma resposta.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="flex flex-col h-[70vh] max-w-3xl mx-auto">
            <h2 className="text-xl font-semibold text-center mb-4 text-gray-300">Converse com a IA</h2>
            <div className="flex-grow bg-gray-900/70 rounded-t-lg p-4 overflow-y-auto space-y-4">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <Bot size={48} />
                        <p className="mt-2">Faça uma pergunta para começar.</p>
                    </div>
                )}
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-lg p-3 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
                            <div className="prose prose-invert max-w-none prose-p:my-0">
                                <Markdown>{msg.text}</Markdown>
                            </div>
                        </div>
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex justify-start">
                        <div className="max-w-lg p-3 rounded-2xl bg-gray-700 text-gray-200 rounded-bl-none">
                           <Loader className="animate-spin w-5 h-5"/>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="flex p-4 bg-gray-800 rounded-b-lg border-t border-gray-700">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Digite sua mensagem..."
                    className="flex-grow p-2 bg-gray-700 border border-gray-600 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    disabled={isLoading}
                />
                <button
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-r-lg hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    <Send size={20} />
                </button>
            </div>
        </div>
    );
};

export default Chatbot;
