
import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { BrainCircuit, Loader, Sparkles } from 'lucide-react';
import Markdown from 'react-markdown';

const ThinkingModeGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = useCallback(async () => {
        if (!prompt) {
            setError('Por favor, insira sua consulta complexa.');
            return;
        }

        setIsLoading(true);
        setResult('');
        setError('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const model = 'gemini-2.5-pro';
            const fullPrompt = `
                **MODO DE PENSAMENTO AVANÇADO ATIVADO**
                Analise a seguinte consulta complexa com o máximo de profundidade e raciocínio.
                Gere a resposta mais abrangente, detalhada e bem estruturada possível.

                **Consulta do Usuário:**
                ${prompt}
            `;
            
            const response = await ai.models.generateContent({
                model,
                contents: fullPrompt,
                config: {
                    thinkingConfig: { thinkingBudget: 32768 }
                }
            });

            setResult(response.text);

        } catch (err) {
            console.error(err);
            setError('Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.');
        } finally {
            setIsLoading(false);
        }
    }, [prompt]);

    return (
        <div className="flex flex-col items-center text-center">
            <BrainCircuit className="w-16 h-16 mb-4 text-purple-400" />
            <h2 className="text-2xl font-bold mb-2">Modo de Pensamento Avançado</h2>
            <p className="mb-6 text-gray-400 max-w-xl">
                Para suas consultas mais complexas. A IA usará seu raciocínio máximo para fornecer uma resposta detalhada.
            </p>

            <div className="w-full max-w-2xl space-y-4">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Descreva sua tarefa ou pergunta complexa aqui..."
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none min-h-[120px]"
                    rows={5}
                />
                <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold rounded-lg shadow-lg hover:from-purple-600 hover:to-indigo-700 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? <><Loader className="animate-spin mr-2" size={20}/> Processando...</> : <><Sparkles className="mr-2" size={20}/> Analisar e Gerar</>}
                </button>
            </div>

            {error && <p className="mt-4 text-red-400">{error}</p>}

            {result && (
                <div className="mt-8 w-full max-w-4xl text-left bg-gray-900/70 p-6 rounded-lg">
                     <h3 className="text-xl font-semibold mb-4 text-purple-300">Resposta da IA</h3>
                     <div className="prose prose-invert max-w-none prose-p:text-gray-300 prose-pre:bg-gray-800 prose-pre:p-4 prose-pre:rounded-md">
                        <Markdown>{result}</Markdown>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ThinkingModeGenerator;
