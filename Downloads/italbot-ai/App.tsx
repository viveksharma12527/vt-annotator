import React, { useState, useCallback } from 'react';
import { IndustrySelection } from './components/IndustrySelection';
import { ChatInterface } from './components/ChatInterface';
import { IndustryConfig, AgentIdentity, Language, IndustryType } from './types';
import { ITALIAN_NAMES, COFIDIS_NAMES } from './constants';

function App() {
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryConfig | null>(null);
  const [agentIdentity, setAgentIdentity] = useState<AgentIdentity | null>(null);
  const [language, setLanguage] = useState<Language>('IT');

  const handleIndustrySelect = useCallback((industry: IndustryConfig) => {
    let nameList = ITALIAN_NAMES;
    
    // Use specific names for Cofidis Loans scenario
    if (industry.id === IndustryType.LOANS) {
      nameList = COFIDIS_NAMES;
    }

    // Select a random name each time a session starts from the appropriate list
    const randomName = nameList[Math.floor(Math.random() * nameList.length)];
    
    setAgentIdentity({
      name: randomName,
      avatarUrl: '' // Using generated Initials in UI
    });
    setSelectedIndustry(industry);
  }, []);

  const handleReset = useCallback(() => {
    setSelectedIndustry(null);
    setAgentIdentity(null);
  }, []);

  if (!selectedIndustry || !agentIdentity) {
    return (
      <IndustrySelection 
        onSelect={handleIndustrySelect} 
        language={language}
        onLanguageChange={setLanguage}
      />
    );
  }

  return (
    <ChatInterface 
      industry={selectedIndustry} 
      agent={agentIdentity} 
      onReset={handleReset}
      language={language}
    />
  );
}

export default App;