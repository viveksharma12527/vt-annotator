import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, RefreshCw, MoreVertical, Phone, Video, Paperclip, ChevronLeft } from 'lucide-react';
import { IndustryConfig, ChatMessage, AgentIdentity, Language } from '../types';
import { createSession, sendMessageToAgent } from '../services/geminiService';
import { UI_STRINGS } from '../constants';

interface ChatInterfaceProps {
  industry: IndustryConfig;
  agent: AgentIdentity;
  onReset: () => void;
  language: Language;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ industry, agent, onReset, language }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const ui = UI_STRINGS[language];

  // Initialize chat on mount
  useEffect(() => {
    try {
      createSession(industry, agent.name, language);
      
      // Initial greeting
      const initialMsg: ChatMessage = {
        id: 'init-1',
        role: 'model',
        text: industry.initialGreeting(agent.name),
        timestamp: new Date()
      };
      setMessages([initialMsg]);
    } catch (e) {
      console.error("Failed to init session", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(scrollToBottom, [messages, isTyping]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setIsTyping(true);

    try {
      const stream = await sendMessageToAgent(userMsg.text);
      
      let fullResponse = "";
      const responseId = (Date.now() + 1).toString();
      
      // Create placeholder message
      setMessages(prev => [...prev, {
        id: responseId,
        role: 'model',
        text: "",
        timestamp: new Date()
      }]);

      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev => prev.map(msg => 
          msg.id === responseId ? { ...msg, text: fullResponse } : msg
        ));
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: ui.error,
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 md:p-4 lg:p-8">
      <div className="flex flex-col flex-grow w-full max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        
        {/* Header */}
        <div className={`px-6 py-4 flex items-center justify-between bg-gradient-to-r ${industry.bgGradient} text-white`}>
          <div className="flex items-center space-x-4">
            <button onClick={onReset} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="relative">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-${industry.accentColor} to-white flex items-center justify-center text-slate-800 font-bold text-xl border-2 border-white`}>
                {agent.name.charAt(0)}
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-slate-800 rounded-full"></span>
            </div>
            <div>
              <h2 className="font-semibold text-lg">{agent.name}</h2>
              <p className="text-xs text-gray-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                {ui.online} • {industry.name}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 md:space-x-3">
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-300 hover:text-white">
               <Phone className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-300 hover:text-white">
               <Video className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-300 hover:text-white">
               <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-gray-50 scrollbar-hide">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[85%] md:max-w-[70%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs 
                  ${msg.role === 'user' ? 'bg-gray-400' : `bg-${industry.accentColor}`}`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                
                <div className={`px-5 py-3.5 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed
                  ${msg.role === 'user' 
                    ? `bg-${industry.accentColor} text-white rounded-br-none` 
                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                  } ${msg.isError ? 'bg-red-50 text-red-600 border-red-200' : ''}`}
                >
                  {msg.text}
                  <div className={`text-[10px] mt-1 text-right opacity-70`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start w-full">
              <div className="flex items-end gap-2">
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs bg-${industry.accentColor}`}>
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100">
          <div className="relative flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-xl p-2 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-300 transition-all shadow-inner">
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-200/50">
              <Paperclip className="w-5 h-5" />
            </button>
            
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`${ui.placeholder} ${agent.name}...`}
              className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-32 py-2.5 text-gray-700 placeholder-gray-400 text-sm md:text-base"
              rows={1}
            />

            <button 
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className={`p-2.5 rounded-lg transition-all duration-200 
                ${input.trim() && !isTyping 
                  ? `bg-${industry.accentColor} text-white shadow-md hover:brightness-110 hover:-translate-y-0.5` 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <div className="text-center mt-2">
             <span className="text-xs text-gray-400">{ui.poweredBy}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
