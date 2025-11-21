import React from 'react';
import { Briefcase, ShoppingBag, Coffee, ArrowRight, Globe, BadgeEuro } from 'lucide-react';
import { getIndustries, UI_STRINGS } from '../constants';
import { IndustryConfig, Language } from '../types';

interface IndustrySelectionProps {
  onSelect: (industry: IndustryConfig) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export const IndustrySelection: React.FC<IndustrySelectionProps> = ({ onSelect, language, onLanguageChange }) => {
  const ui = UI_STRINGS[language];
  const industries = getIndustries(language);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Briefcase': return <Briefcase className="w-8 h-8 mb-4 text-blue-400" />;
      case 'ShoppingBag': return <ShoppingBag className="w-8 h-8 mb-4 text-pink-400" />;
      case 'Coffee': return <Coffee className="w-8 h-8 mb-4 text-emerald-400" />;
      case 'BadgeEuro': return <BadgeEuro className="w-8 h-8 mb-4 text-red-400" />;
      default: return <Briefcase className="w-8 h-8 mb-4" />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      
      {/* Language Switcher */}
      <div className="absolute top-6 right-6 flex items-center space-x-2 bg-slate-800/50 p-2 rounded-lg border border-slate-700">
        <Globe className="w-4 h-4 text-slate-400" />
        <button 
          onClick={() => onLanguageChange('IT')}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${language === 'IT' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          IT
        </button>
        <button 
          onClick={() => onLanguageChange('EN')}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${language === 'EN' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          EN
        </button>
      </div>

      <div className="max-w-4xl w-full text-center mb-12 space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
          {ui.title} <span className="text-indigo-400">{ui.subtitle}</span>
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
          {ui.description}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-6xl">
        {industries.map((industry) => (
          <button
            key={industry.id}
            onClick={() => onSelect(industry)}
            className="group relative bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500/50 rounded-2xl p-6 text-left transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 flex flex-col h-full"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity" />
            
            {getIcon(industry.icon)}
            
            <h3 className="text-xl font-bold text-white mb-2">{industry.name}</h3>
            <p className="text-slate-400 mb-6 flex-grow text-sm">{industry.description}</p>
            
            <div className="flex items-center text-sm font-medium text-indigo-400 group-hover:text-indigo-300 mt-auto">
              {ui.selectButton} <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </div>
          </button>
        ))}
      </div>

      <div className="mt-16 text-slate-600 text-sm">
        {ui.footer}
      </div>
    </div>
  );
};