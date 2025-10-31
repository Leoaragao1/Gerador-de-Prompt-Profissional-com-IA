
import React, { useState } from 'react';
import PromptGenerator from './components/PromptGenerator';
import ThinkingModeGenerator from './components/ThinkingModeGenerator';
import ImageGenerator from './components/ImageGenerator';
import VideoGenerator from './components/VideoGenerator';
import Chatbot from './components/Chatbot';
import { BotMessageSquare, BrainCircuit, Clapperboard, Image, Sparkles } from 'lucide-react';

type Tab = 'prompt' | 'thinking' | 'image' | 'video' | 'chat';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('prompt');

  const renderContent = () => {
    switch (activeTab) {
      case 'prompt':
        return <PromptGenerator />;
      case 'thinking':
        return <ThinkingModeGenerator />;
      case 'image':
        return <ImageGenerator />;
      case 'video':
        return <VideoGenerator />;
      case 'chat':
        return <Chatbot />;
      default:
        return <PromptGenerator />;
    }
  };

  const TabButton = ({ tab, label, icon }: { tab: Tab; label: string; icon: React.ReactNode }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out ${
        activeTab === tab
          ? 'bg-blue-600 text-white shadow-lg'
          : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/70 hover:text-white'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 font-sans">
      <div className="w-full max-w-7xl mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 py-2">
            Gerador de Prompt Profissional com IA
          </h1>
          <p className="text-gray-400 mt-2 max-w-2xl mx-auto">
            Sua ferramenta completa para criar prompts, imagens, vídeos e conversar com uma IA avançada.
          </p>
        </header>

        <nav className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-4 mb-8 p-2 bg-gray-800/60 rounded-xl shadow-inner">
          <TabButton tab="prompt" label="Gerador de Prompt" icon={<Sparkles size={20} />} />
          <TabButton tab="thinking" label="Modo Avançado" icon={<BrainCircuit size={20} />} />
          <TabButton tab="image" label="Gerador de Imagem" icon={<Image size={20} />} />
          <TabButton tab="video" label="Gerador de Vídeo" icon={<Clapperboard size={20} />} />
          <TabButton tab="chat" label="Chatbot" icon={<BotMessageSquare size={20} />} />
        </nav>

        <main className="bg-gray-800/60 rounded-xl shadow-lg p-4 sm:p-8 min-h-[60vh]">
          {renderContent()}
        </main>
        
        <footer className="text-center mt-8 text-gray-500 text-sm">
            <p>Powered by Google Gemini</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
