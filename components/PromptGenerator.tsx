
import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ArrowRight, FileText, Loader, Target, MapPin, Sparkles } from 'lucide-react';
import Markdown from 'react-markdown';

const PromptGenerator: React.FC = () => {
    const [platform, setPlatform] = useState<string>('');
    const [fileContent, setFileContent] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [goal, setGoal] = useState<string>('');
    const [conversation, setConversation] = useState<{ role: 'user' | 'model'; content: string }[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setFileName(file.name);
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                setFileContent(text);
            };
            reader.readAsText(file);
        }
    };
    
    const generatePrompt = useCallback(async () => {
        if (!goal || !platform) {
            setError('Por favor, descreva o seu objetivo e onde o prompt será usado.');
            return;
        }

        setIsLoading(true);
        setError('');
        
        const userMessage = `**Plataforma Alvo:** ${platform}\n**Objetivo:** ${goal}${fileName ? `\n**Conteúdo do Banco de Dados (${fileName}):**\n\`\`\`\n${fileContent}\n\`\`\`` : ''}`;
        
        setConversation(prev => [...prev, { role: 'user', content: userMessage }]);
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const promptForGemini = `
                Você é um especialista em engenharia de prompts. Sua tarefa é criar um prompt profissional e otimizado.
                Analise as informações a seguir e, se necessário, faça UMA pergunta de esclarecimento para refinar o pedido do usuário.
                Se as informações forem suficientes, gere o prompt final.
                Use o grounding do Google Search para encontrar as melhores práticas para a plataforma alvo.

                **Contexto Fornecido pelo Usuário:**
                - **Plataforma Alvo:** ${platform}
                - **Banco de Dados/Contexto:** ${fileContent ? `O usuário forneceu o seguinte conteúdo:\n${fileContent}` : "Nenhum banco de dados fornecido."}
                - **Objetivo do Usuário:** ${goal}
                - **Conversa Anterior:** ${JSON.stringify(conversation)}

                **Sua Resposta:**
                - Se precisar de mais informações, faça uma pergunta clara e concisa.
                - Se tiver informações suficientes, gere o prompt final dentro de um bloco de código, começando com uma breve explicação sobre por que o prompt foi estruturado dessa forma para a plataforma "${platform}".
            `;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: promptForGemini,
                config: {
                    tools: [{googleSearch: {}}],
                },
            });

            const textResponse = response.text;
            setConversation(prev => [...prev, { role: 'model', content: textResponse }]);
        } catch (err) {
            console.error(err);
            setError('Ocorreu um erro ao se comunicar com a IA. Verifique sua chave de API e tente novamente.');
            setConversation(prev => [...prev, { role: 'model', content: `**Erro:** Não foi possível gerar uma resposta.` }]);
        } finally {
            setIsLoading(false);
        }
    }, [goal, platform, fileContent, fileName, conversation]);
    
    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-center text-blue-300">Crie seu Prompt Profissional</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                {/* Step 1 */}
                <div className="bg-gray-700/50 p-4 rounded-lg">
                    <label htmlFor="platform" className="flex items-center gap-2 font-medium mb-2 text-gray-300"><MapPin size={16}/> 1. Onde você usará o prompt?</label>
                    <input 
                        id="platform" 
                        type="text"
                        value={platform} 
                        onChange={(e) => setPlatform(e.target.value)} 
                        placeholder="Ex: ChatGPT, Midjourney, Claude 3"
                        className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                </div>
                {/* Step 2 */}
                <div className="bg-gray-700/50 p-4 rounded-lg">
                     <label htmlFor="database" className="flex items-center gap-2 font-medium mb-2 text-gray-300"><FileText size={16}/> 2. Envie um banco de dados (Opcional)</label>
                    <input id="database" type="file" onChange={handleFileChange} accept=".txt,.csv,.json,.md" className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"/>
                    {fileName && <p className="text-xs text-gray-400 mt-2 truncate">Arquivo: {fileName}</p>}
                </div>
                 {/* Step 3 */}
                <div className="bg-gray-700/50 p-4 rounded-lg">
                     <label htmlFor="goal" className="flex items-center gap-2 font-medium mb-2 text-gray-300"><Target size={16}/> 3. Descreva o que você precisa</label>
                    <textarea id="goal" value={goal} onChange={(e) => setGoal(e.target.value)} rows={1} placeholder="Ex: Um prompt para criar 5 posts de Instagram..." className="w-full p-2 bg-gray-800 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[42px]"></textarea>
                </div>
            </div>

            <div className="text-center">
                <button onClick={generatePrompt} disabled={isLoading} className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-lg shadow-lg hover:from-blue-600 hover:to-purple-700 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isLoading ? <><Loader className="animate-spin mr-2" size={20}/> Gerando...</> : <><Sparkles className="mr-2" size={20}/> Gerar Prompt</>}
                </button>
            </div>
            
            {error && <p className="text-red-400 text-center">{error}</p>}
            
            {conversation.length > 0 && (
                <div className="mt-8 bg-gray-900/70 p-4 rounded-lg space-y-4">
                    <h3 className="text-lg font-semibold text-gray-300 border-b border-gray-700 pb-2">Resultado</h3>
                    {conversation.map((msg, index) => (
                        <div key={index} className={`p-4 rounded-lg ${msg.role === 'user' ? 'bg-gray-800' : 'bg-transparent'}`}>
                            <div className="prose prose-invert max-w-none prose-p:text-gray-300 prose-pre:bg-gray-900 prose-pre:p-4 prose-pre:rounded-md">
                                <Markdown>{msg.content}</Markdown>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PromptGenerator;
