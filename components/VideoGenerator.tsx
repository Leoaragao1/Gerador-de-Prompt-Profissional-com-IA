import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Clapperboard, Film, Loader, Sparkles, KeyRound } from 'lucide-react';

// Define window.aistudio for TypeScript
// Fix: Use a named interface 'AIStudio' to avoid declaration conflicts with other global types.
declare global {
    interface AIStudio {
        hasSelectedApiKey: () => Promise<boolean>;
        openSelectKey: () => Promise<void>;
    }
    interface Window {
        // FIX: Made `aistudio` optional to resolve a declaration conflict error. This is safe as its existence is checked before use.
        aistudio?: AIStudio;
    }
}

type AspectRatio = '16:9' | '9:16';
type StatusMessage = { text: string; emoji: string };

const LOADING_MESSAGES: StatusMessage[] = [
    { text: 'Iniciando o motor de renderização...', emoji: '🚀' },
    { text: 'Preparando os pixels...', emoji: '🎨' },
    { text: 'Construindo a linha do tempo...', emoji: '🎬' },
    { text: 'A IA está dirigindo a cena...', emoji: '🤖' },
    { text: 'Aguardando a mágica acontecer...', emoji: '✨' },
    { text: 'Quase lá, polindo os detalhes...', emoji: ' polishing...' }
];

const VideoGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [apiKeySelected, setApiKeySelected] = useState<boolean | null>(null);
    const [statusMessage, setStatusMessage] = useState<StatusMessage>(LOADING_MESSAGES[0]);

    const checkApiKey = useCallback(async () => {
        if (window.aistudio) {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            setApiKeySelected(hasKey);
        } else {
            setApiKeySelected(false); // Fallback if aistudio is not available
        }
    }, []);

    useEffect(() => {
        checkApiKey();
    }, [checkApiKey]);
    
    useEffect(() => {
        let interval: number;
        if (isLoading) {
            interval = window.setInterval(() => {
                setStatusMessage(prev => {
                    const currentIndex = LOADING_MESSAGES.indexOf(prev);
                    const nextIndex = (currentIndex + 1) % LOADING_MESSAGES.length;
                    return LOADING_MESSAGES[nextIndex];
                });
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [isLoading]);

    const handleSelectKey = async () => {
        if (window.aistudio) {
            await window.aistudio.openSelectKey();
            setApiKeySelected(true); // Assume success to improve UX
        }
    };

    const generateVideo = useCallback(async () => {
        if (!prompt) {
            setError('Por favor, insira um prompt para gerar o vídeo.');
            return;
        }

        setIsLoading(true);
        setError('');
        setVideoUrl(null);
        setStatusMessage(LOADING_MESSAGES[0]);

        try {
            // Re-create instance to get latest key
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            let operation = await ai.models.generateVideos({
                model: 'veo-3.1-fast-generate-preview',
                prompt: prompt,
                config: {
                    numberOfVideos: 1,
                    resolution: '720p',
                    aspectRatio: aspectRatio,
                }
            });

            while (!operation.done) {
                await new Promise(resolve => setTimeout(resolve, 10000));
                operation = await ai.operations.getVideosOperation({ operation: operation });
            }

            const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
            if (downloadLink) {
                 // The response.body contains the MP4 bytes. You must append an API key when fetching from the download link.
                const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
                const blob = await response.blob();
                const objectUrl = URL.createObjectURL(blob);
                setVideoUrl(objectUrl);
            } else {
                throw new Error("Não foi possível obter o link de download do vídeo.");
            }

        } catch (err: any) {
            console.error(err);
            let errorMessage = 'Falha ao gerar o vídeo. Verifique seu prompt e tente novamente.';
            if (err.message && err.message.includes("Requested entity was not found")) {
                errorMessage = "Chave de API inválida ou não encontrada. Por favor, selecione uma chave válida.";
                setApiKeySelected(false);
            }
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, [prompt, aspectRatio]);
    
    if (apiKeySelected === null) {
        return <div className="flex justify-center items-center h-full"><Loader className="animate-spin" /></div>
    }

    if (!apiKeySelected) {
        return (
            <div className="flex flex-col items-center justify-center text-center h-full p-8 bg-gray-800 rounded-lg">
                <KeyRound size={48} className="text-yellow-400 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Chave de API Necessária</h2>
                <p className="mb-4 text-gray-400 max-w-md">Para gerar vídeos, você precisa selecionar uma chave de API do Google AI Studio. Isso pode incorrer em cobranças.</p>
                <p className="mb-6 text-sm text-gray-500">Para mais informações, consulte a <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">documentação de cobrança</a>.</p>
                <button
                    onClick={handleSelectKey}
                    className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
                >
                    Selecionar Chave de API
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center text-center">
            <Film className="w-16 h-16 mb-4 text-rose-400" />
            <h2 className="text-2xl font-bold mb-2">Gerador de Vídeo (Veo)</h2>
            <p className="mb-6 text-gray-400 max-w-xl">
                Transforme suas ideias em vídeos curtos. Descreva uma cena e veja a IA dar vida a ela.
            </p>

            <div className="w-full max-w-2xl space-y-4">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ex: Um close-up de uma gota de chuva caindo em uma poça em câmera lenta..."
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none min-h-[80px]"
                    rows={3}
                />
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-400">Proporção:</span>
                         <button onClick={() => setAspectRatio('16:9')} className={`px-4 py-2 rounded-lg ${aspectRatio === '16:9' ? 'bg-rose-600' : 'bg-gray-600'}`}>Paisagem</button>
                        <button onClick={() => setAspectRatio('9:16')} className={`px-4 py-2 rounded-lg ${aspectRatio === '9:16' ? 'bg-rose-600' : 'bg-gray-600'}`}>Retrato</button>
                    </div>

                    <button
                        onClick={generateVideo}
                        disabled={isLoading}
                         className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold rounded-lg shadow-lg hover:from-rose-600 hover:to-red-700 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                         {isLoading ? <><Loader className="animate-spin mr-2" size={20}/> Gerando...</> : <><Clapperboard className="mr-2" size={20}/> Gerar Vídeo</>}
                    </button>
                </div>
            </div>

            {error && <p className="mt-4 text-red-400">{error}</p>}

            <div className="mt-8 w-full max-w-2xl min-h-[300px] bg-gray-900/70 rounded-lg flex items-center justify-center p-4">
                 {isLoading && (
                    <div className="flex flex-col items-center gap-4 text-rose-300">
                        <Loader className="w-12 h-12 animate-spin" />
                        <p className="font-medium">{statusMessage.emoji} {statusMessage.text}</p>
                        <p className="text-sm text-gray-400">(A geração de vídeo pode levar alguns minutos)</p>
                    </div>
                )}
                {!isLoading && videoUrl && (
                    <video src={videoUrl} controls autoPlay loop className="max-w-full max-h-[512px] rounded-md shadow-2xl"/>
                )}
                 {!isLoading && !videoUrl && (
                    <p className="text-gray-500">Seu vídeo aparecerá aqui.</p>
                )}
            </div>
        </div>
    );
};

export default VideoGenerator;