
import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Image as ImageIcon, Loader, Sparkles } from 'lucide-react';

type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";

const ImageGenerator: React.FC = () => {
    const [prompt, setPrompt] = useState<string>('');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
    const [imageUrl, setImageUrl] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const generateImage = useCallback(async () => {
        if (!prompt) {
            setError('Por favor, insira um prompt para gerar a imagem.');
            return;
        }

        setIsLoading(true);
        setError('');
        setImageUrl('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: prompt,
                config: {
                  numberOfImages: 1,
                  outputMimeType: 'image/jpeg',
                  aspectRatio: aspectRatio,
                },
            });
            
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            const generatedImageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
            setImageUrl(generatedImageUrl);

        } catch (err) {
            console.error(err);
            setError('Falha ao gerar a imagem. Verifique seu prompt e a chave de API.');
        } finally {
            setIsLoading(false);
        }
    }, [prompt, aspectRatio]);

    const aspectRatios: { value: AspectRatio, label: string }[] = [
        { value: "1:1", label: "Quadrado" },
        { value: "16:9", label: "Paisagem" },
        { value: "9:16", label: "Retrato" },
        { value: "4:3", label: "Padrão" },
        { value: "3:4", label: "Vertical" },
    ];

    return (
        <div className="flex flex-col items-center text-center">
            <ImageIcon className="w-16 h-16 mb-4 text-teal-400" />
            <h2 className="text-2xl font-bold mb-2">Gerador de Imagem</h2>
            <p className="mb-6 text-gray-400 max-w-xl">
                Descreva a imagem que você quer criar. Seja criativo e detalhado para melhores resultados.
            </p>

            <div className="w-full max-w-2xl space-y-4">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ex: Um astronauta surfando em uma onda cósmica, estilo synthwave..."
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none min-h-[80px]"
                    rows={3}
                />
                
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                    <div>
                        <label className="text-sm font-medium text-gray-400 mr-2">Proporção:</label>
                        <select
                            value={aspectRatio}
                            onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                            className="p-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
                        >
                            {aspectRatios.map(ar => (
                                <option key={ar.value} value={ar.value}>{ar.label} ({ar.value})</option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={generateImage}
                        disabled={isLoading}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold rounded-lg shadow-lg hover:from-teal-600 hover:to-cyan-700 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <><Loader className="animate-spin mr-2" size={20}/> Gerando...</> : <><Sparkles className="mr-2" size={20}/> Gerar Imagem</>}
                    </button>
                </div>
            </div>

            {error && <p className="mt-4 text-red-400">{error}</p>}

            <div className="mt-8 w-full max-w-2xl min-h-[300px] bg-gray-900/70 rounded-lg flex items-center justify-center p-4">
                {isLoading && <Loader className="w-12 h-12 animate-spin text-teal-500" />}
                {!isLoading && imageUrl && (
                    <img src={imageUrl} alt="Generated" className="max-w-full max-h-[512px] rounded-md shadow-2xl"/>
                )}
                 {!isLoading && !imageUrl && (
                    <p className="text-gray-500">Sua imagem aparecerá aqui.</p>
                )}
            </div>
        </div>
    );
};

export default ImageGenerator;
