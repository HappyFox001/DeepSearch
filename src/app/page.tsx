'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { InformationSearchAPI, SearchResponse } from './services/api';
import TypeWriter from './components/TypeWriter';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchResponse | null>(null);
  const [showSteps, setShowSteps] = useState({
    originalQuestion: false,
    refinedThinking: false,
    refinedQuestions: false,
    searchComplete: false,
    thinkingProcess: false,
    finalAnswer: false
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  
  const steps = useMemo(() => [
    'originalQuestion',
    'refinedThinking',
    'refinedQuestions',
    'searchComplete',
    'thinkingProcess',
    'finalAnswer'
  ], []);

  const resetSteps = useCallback(() => {
    setCurrentStep(0);
    setShowSteps({
      originalQuestion: false,
      refinedThinking: false,
      refinedQuestions: false,
      searchComplete: false,
      thinkingProcess: false,
      finalAnswer: false
    });
  }, []);

  const handleStepComplete = useCallback(() => {
    setCurrentStep(prev => prev + 1);
  }, []);

  useEffect(() => {
    if (currentStep < steps.length) {
      setShowSteps(prev => ({
        ...prev,
        [steps[currentStep]]: true
      }));
    }
  }, [currentStep, steps]);

  useEffect(() => {
    if (searchResult) {
      resetSteps();
      setShowSteps(prev => ({ ...prev, originalQuestion: true }));
    }
  }, [searchResult]);

  const api = new InformationSearchAPI();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchResult(null);
    resetSteps();
    try {
      const result = await api.sendQuery(searchQuery);
      setSearchResult(result);
      console.log('Search result:', result);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      {/* Logo Section */}
      <div className="mb-12">
        <h1 className="text-8xl font-light tracking-tight text-white drop-shadow-2xl">
            <span className="font-medium bg-gradient-to-r from-red-500 to-yellow-500 text-transparent bg-clip-text">Deep</span>
            <span className="font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">Search</span>
        </h1>
      </div>

      {/* Search Box Section */}
      <div className="w-full max-w-[684px]">
        <div className="relative">
          <div className="flex items-center relative bg-gray-900/80 backdrop-blur-md rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.3)] hover:shadow-[0_3px_15px_rgba(59,130,246,0.3)] transition-all duration-300 border border-gray-700/40">
            {/* Search Icon */}
            <div className="pl-6">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            {/* Search Input */}
            <input
              type="text"
              className="w-full py-4 px-4 text-gray-100 bg-transparent rounded-full focus:outline-none placeholder:text-gray-500 text-lg"
              placeholder="在 DeepSearch 中搜索，或者输入网址"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isSearching}
            />
            
            {/* Right Icons */}
            <div className="pr-6 flex space-x-3">
              {/* Loading Indicator */}
              {isSearching && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
              )}
              
              {/* Microphone Icon */}
              <button className="p-2 hover:bg-blue-500/10 rounded-full transition-colors duration-200">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
              {/* Camera Icon */}
              <button className="p-2 hover:bg-blue-500/10 rounded-full transition-colors duration-200">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Search Buttons */}
        <div className="flex justify-center space-x-4 mt-8">
          <button 
            className="btn-magical btn-shine btn-glow px-6 py-3 bg-gradient-to-r from-[#4f3bc1] via-[#7b5ffc] to-[#4f3bc1] text-white rounded-lg transition-all duration-300 font-medium text-sm border border-[#7b5ffc] hover:scale-105 hover:from-[#5a44d5] hover:via-[#8d74ff] hover:to-[#5a44d5]"
            onClick={handleSearch}
            disabled={isSearching}
          >
            深度思考
          </button>
          <button 
            className="btn-magical btn-shine btn-glow px-6 py-3 bg-gradient-to-r from-[#c31432] via-[#ff3e4d] to-[#c31432] text-white rounded-lg transition-all duration-300 font-medium text-sm border border-[#ff3e4d] hover:scale-105 hover:from-[#d51838] hover:via-[#ff5262] hover:to-[#d51838]"
            disabled={isSearching}
          >
            交叉验证
          </button>
          <button 
            className="btn-magical btn-shine btn-glow px-6 py-3 bg-gradient-to-r from-[#11998e] via-[#38ef7d] to-[#11998e] text-white rounded-lg transition-all duration-300 font-medium text-sm border border-[#38ef7d] hover:scale-105 hover:from-[#13ab9f] hover:via-[#4dff91] hover:to-[#13ab9f]"
            disabled={isSearching}
          >
            聚焦当下
          </button>
        </div>

        {/* Search Results */}
        {searchResult && (
          <div className="mt-8 w-full">
            <div className="bg-gray-900/80 backdrop-blur-md rounded-lg p-6 text-gray-100 border border-gray-700/40 transition-all duration-300">
              {/* Expand/Collapse Indicator */}
              <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsPanelOpen(!isPanelOpen)}>
                <h3 className="text-base font-medium text-gray-300">思考过程</h3>
                <div className={`transform transition-transform duration-300 ${isPanelOpen ? 'rotate-180' : ''}`}>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
                
              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isPanelOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                {showSteps.originalQuestion && (
                  <div className="animate-fadeIn">
                    <h3 className="text-sm text-blue-400 mb-2">原始问题</h3>
                    <TypeWriter 
                      text={searchResult.original_question}
                      className="text-xs bg-gradient-to-r from-blue-500 to-blue-300 bg-clip-text text-transparent"
                      onComplete={handleStepComplete}
                    />
                  </div>
                )}
                
                {showSteps.refinedThinking && (
                  <div className="animate-fadeIn">
                    <h3 className="text-sm text-purple-400 mb-2">问题思考</h3>
                    <TypeWriter 
                      text={searchResult.refined_thinking_process}
                      className="text-xs bg-gradient-to-r from-purple-500 to-purple-300 bg-clip-text text-transparent"
                      onComplete={handleStepComplete}
                    />
                  </div>
                )}

                {showSteps.refinedQuestions && (
                  <div className="animate-fadeIn">
                    <h3 className="text-sm text-emerald-400 mb-2">修正后问题</h3>
                    <ul className="space-y-1">
                      {searchResult.refined_questions.map((q, i) => (
                        <TypeWriter 
                          key={i}
                          text={q}
                          delay={30}
                          className="text-xs bg-gradient-to-r from-emerald-500 to-emerald-300 bg-clip-text text-transparent"
                          onComplete={i === searchResult.refined_questions.length - 1 
                            ? handleStepComplete
                            : undefined}
                        />
                      ))}
                    </ul>
                  </div>
                )}

                {showSteps.searchComplete && (
                  <div className="animate-fadeIn">
                    <TypeWriter 
                      text="搜索完成"
                      className="text-xs bg-gradient-to-r from-amber-500 to-amber-300 bg-clip-text text-transparent font-medium"
                      onComplete={handleStepComplete}
                    />
                  </div>
                )}

                {showSteps.thinkingProcess && (
                  <div className="animate-fadeIn">
                    <h3 className="text-sm text-rose-400 mb-2">整合结果</h3>
                    <TypeWriter 
                      text={searchResult.thinking_process}
                      className="text-xs bg-gradient-to-r from-rose-500 to-rose-300 bg-clip-text text-transparent"
                      onComplete={handleStepComplete}
                    />
                  </div>
                )}

                {showSteps.finalAnswer && (
                  <div className="animate-fadeIn mt-6 border-t border-gray-700/40 pt-4">
                    <h3 className="text-sm text-cyan-400 mb-2">最终答案</h3>
                    <TypeWriter 
                      text={searchResult.final_answer}
                      className="text-sm bg-gradient-to-r from-cyan-500 via-cyan-400 to-cyan-300 bg-clip-text text-transparent font-medium"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
