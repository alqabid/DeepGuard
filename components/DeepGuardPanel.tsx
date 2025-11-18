import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, ShieldCheck, Lock, Zap, FileJson, Copy, MessageSquare, BarChart2, Send, User, Bot, Check, CheckCircle } from 'lucide-react';
import { AnalysisResult, RiskLevel, DecoyData, Message, ChatMessage } from '../types';
import TrustScoreGauge from './TrustScoreGauge';
import { generateDecoyData, createAgentChat } from '../services/geminiService';
import { Chat, GenerateContentResponse } from '@google/genai';

interface DeepGuardPanelProps {
  analysis: AnalysisResult | null;
  loading: boolean;
  messageContent?: string; // Not strictly used as we use selectedMessage context via analysis flow, but kept for prop compat
}

// We need the full message object for the chat context
// Assuming App passes it or we rely on the fact that 'analysis' is triggered by 'selectedMessage'
// To be cleaner, let's assume the parent manages the message context
// But for this component, we need 'selectedMessage' to pass to 'createAgentChat'
// Updating props to include selectedMessage implicitly or explicitly
// Since the parent App.tsx passes it, we'll update the interface.

interface ExtendedDeepGuardPanelProps extends DeepGuardPanelProps {
  selectedMessage?: Message | null;
}

// Correction: The App.tsx passes (analysis, loading, messageContent).
// We need to modify App.tsx to pass selectedMessage, OR we rely on closure if this was defined inside App (it's not).
// Let's adjust the component to accept 'selectedMessage' prop which is cleaner.

const DeepGuardPanel: React.FC<ExtendedDeepGuardPanelProps & { selectedMessage: Message | null }> = ({ analysis, loading, selectedMessage }) => {
  const [activeTab, setActiveTab] = useState<'report' | 'chat'>('report');
  const [decoyData, setDecoyData] = useState<DecoyData | null>(null);
  const [generatingDecoy, setGeneratingDecoy] = useState(false);
  const [decoyCopied, setDecoyCopied] = useState(false);
  const [replyInjected, setReplyInjected] = useState(false);
  
  // Chat State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize Chat when analysis completes
  useEffect(() => {
    if (analysis && selectedMessage) {
      const newChat = createAgentChat(selectedMessage, analysis);
      setChatSession(newChat);
      setChatHistory([
        {
          id: 'init-1',
          role: 'model',
          text: `I've analyzed this message from ${selectedMessage.sender}. The risk level is ${analysis.riskLevel}. Would you like a breakdown of the red flags?`
        }
      ]);
      setDecoyData(null); // Reset decoy data for new message
      setReplyInjected(false);
      setDecoyCopied(false);
      setActiveTab(analysis.riskLevel === RiskLevel.SAFE ? 'report' : 'report');
    }
  }, [analysis, selectedMessage]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isAgentTyping, activeTab]);

  const handleGenerateDecoy = async () => {
    if (!analysis || !selectedMessage) return;
    setGeneratingDecoy(true);
    setActiveTab('report'); // Switch to report view to show the result
    try {
      const data = await generateDecoyData(selectedMessage.content, analysis.reasoning);
      setDecoyData(data);
      setReplyInjected(false);
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingDecoy(false);
    }
  };

  const handleCopyDecoy = () => {
    if (decoyData) {
      navigator.clipboard.writeText(decoyData.generatedEmailBody);
      setDecoyCopied(true);
      setTimeout(() => setDecoyCopied(false), 2000);
    }
  };

  const handleInjectReply = () => {
    setReplyInjected(true);
    // In a real app, this would call an API to draft the email
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !chatSession) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: chatInput
    };

    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    setIsAgentTyping(true);

    try {
      const result: GenerateContentResponse = await chatSession.sendMessage({ message: userMsg.text });
      const responseText = result.text;
      
      if (responseText) {
        setChatHistory(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: responseText
        }]);
      }
    } catch (error) {
      console.error("Chat error", error);
      setChatHistory(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "I'm having trouble connecting to the secure server. Please try again."
      }]);
    } finally {
      setIsAgentTyping(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-900/50 border-l border-slate-800 p-6">
        <div className="relative w-16 h-16 mb-6">
             <div className="absolute inset-0 rounded-full border-t-2 border-neon-blue animate-spin"></div>
             <div className="absolute inset-2 rounded-full border-r-2 border-neon-green animate-spin-reverse"></div>
             <div className="absolute inset-0 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
             </div>
        </div>
        <p className="animate-pulse font-mono text-sm tracking-wider text-neon-blue">AGENT ANALYZING...</p>
        <p className="text-xs mt-2 opacity-50">Scanning intent & patterns</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 bg-slate-900/50 border-l border-slate-800 p-6 text-center">
        <ShieldCheck className="w-16 h-16 mb-4 opacity-20" />
        <h3 className="text-lg font-bold text-slate-400 mb-2">DeepGuard Agent Ready</h3>
        <p className="max-w-xs text-sm">Select a communication from your inbox to initiate security analysis.</p>
      </div>
    );
  }

  const isSafe = analysis.riskLevel === RiskLevel.SAFE || analysis.riskLevel === RiskLevel.LOW;

  return (
    <div className="h-full bg-slate-900 flex flex-col border-l border-slate-800 overflow-hidden">
      {/* Header with Tabs */}
      <div className={`flex flex-col border-b border-slate-800 ${isSafe ? 'bg-neon-green/5' : 'bg-neon-red/5'}`}>
        <div className="p-6 pb-4">
            <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {isSafe ? <ShieldCheck className="text-neon-green" /> : <ShieldAlert className="text-neon-red" />}
                DeepGuard Agent
            </h2>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                isSafe ? 'border-neon-green text-neon-green bg-neon-green/10' : 'border-neon-red text-neon-red bg-neon-red/10'
            }`}>
                {analysis.riskLevel}
            </span>
            </div>
            <TrustScoreGauge score={analysis.trustScore} />
        </div>
        
        <div className="flex px-6 gap-4 text-sm font-medium">
            <button 
                onClick={() => setActiveTab('report')}
                className={`pb-3 px-1 flex items-center gap-2 transition-colors ${activeTab === 'report' ? 'text-white border-b-2 border-neon-blue' : 'text-slate-500 hover:text-slate-300'}`}
            >
                <BarChart2 className="w-4 h-4" /> Analysis
            </button>
            <button 
                onClick={() => setActiveTab('chat')}
                className={`pb-3 px-1 flex items-center gap-2 transition-colors ${activeTab === 'chat' ? 'text-white border-b-2 border-neon-blue' : 'text-slate-500 hover:text-slate-300'}`}
            >
                <MessageSquare className="w-4 h-4" /> Agent Chat
            </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative bg-slate-900/50">
        
        {/* REPORT VIEW */}
        {activeTab === 'report' && (
            <div className="h-full overflow-y-auto p-6 space-y-6 animate-in fade-in duration-300">
                <div>
                    <h3 className="text-xs uppercase tracking-wider text-slate-400 mb-3 font-semibold">Key Indicators</h3>
                    <div className="space-y-2">
                        {analysis.flags.map((flag, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm text-slate-300 bg-slate-800/50 p-2 rounded-lg border border-slate-700">
                                <AlertTriangleIcon risk={analysis.riskLevel} />
                                <span>{flag}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-xs uppercase tracking-wider text-slate-400 mb-2 font-semibold">AI Reasoning</h3>
                    <p className="text-sm text-slate-300 leading-relaxed bg-slate-800/30 p-3 rounded-lg border border-slate-700/50">
                        {analysis.reasoning}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700/50">
                        <div className="text-xs text-slate-400 mb-1">Detected Intent</div>
                        <div className="text-sm text-white font-medium capitalize">{analysis.intent}</div>
                    </div>
                    <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700/50">
                        <div className="text-xs text-slate-400 mb-1">Sentiment</div>
                        <div className="text-sm text-white font-medium capitalize">{analysis.sentiment}</div>
                    </div>
                </div>

                {!isSafe && (
                    <div className="pt-4 border-t border-slate-800">
                        <h3 className="text-xs uppercase tracking-wider text-neon-blue mb-3 font-semibold flex items-center gap-2">
                            <Zap className="w-4 h-4" />
                            Active Defense
                        </h3>
                        
                        {!decoyData ? (
                            <button 
                                onClick={handleGenerateDecoy}
                                disabled={generatingDecoy}
                                className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 border border-neon-blue/50 rounded-xl text-neon-blue font-medium transition-all flex items-center justify-center gap-2 group"
                            >
                                {generatingDecoy ? (
                                    <span className="animate-pulse">Generating Decoy Data...</span>
                                ) : (
                                    <>
                                        <FileJson className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                        Generate Decoy Payload
                                    </>
                                )}
                            </button>
                        ) : (
                            <div className="bg-slate-800/80 rounded-xl border border-neon-blue/30 p-4 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex justify-between items-center border-b border-slate-700 pb-2 mb-2">
                                    <span className="text-xs text-neon-blue font-bold uppercase">Decoy Ready</span>
                                    <button onClick={handleCopyDecoy} className="text-slate-400 hover:text-white transition-colors">
                                      {decoyCopied ? <Check className="w-4 h-4 text-neon-green" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                        <span className="text-slate-500 block">Fake Name</span>
                                        <span className="text-white font-mono">{decoyData.fakeName}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 block">Fake Account</span>
                                        <span className="text-white font-mono">{decoyData.fakeAccount}</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-slate-500 block text-xs mb-1">Decoy Email Body</span>
                                    <div className="bg-black/30 p-2 rounded border border-slate-700 text-xs text-slate-300 font-mono whitespace-pre-wrap h-32 overflow-y-auto">
                                        {decoyData.generatedEmailBody}
                                    </div>
                                </div>
                                <button 
                                    onClick={handleInjectReply}
                                    disabled={replyInjected}
                                    className={`w-full py-2 text-xs font-bold rounded uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
                                        replyInjected 
                                        ? 'bg-neon-green/20 text-neon-green cursor-default' 
                                        : 'bg-neon-blue/20 hover:bg-neon-blue/30 text-neon-blue'
                                    }`}
                                >
                                    {replyInjected ? (
                                        <>
                                            <CheckCircle className="w-4 h-4" /> Reply Drafted
                                        </>
                                    ) : (
                                        "Inject Reply"
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        )}

        {/* CHAT VIEW */}
        {activeTab === 'chat' && (
            <div className="h-full flex flex-col animate-in fade-in duration-300">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {chatHistory.map((msg) => (
                        <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-slate-700' : 'bg-neon-blue/20'}`}>
                                {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-neon-blue" />}
                            </div>
                            <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                                msg.role === 'user' 
                                ? 'bg-slate-700 text-white rounded-tr-none' 
                                : 'bg-slate-800/80 text-slate-200 border border-slate-700 rounded-tl-none'
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isAgentTyping && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-neon-blue/20 flex items-center justify-center flex-shrink-0">
                                <Bot className="w-4 h-4 text-neon-blue" />
                            </div>
                            <div className="bg-slate-800/80 border border-slate-700 p-3 rounded-xl rounded-tl-none flex items-center gap-1">
                                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-75"></span>
                                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-150"></span>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
                
                <div className="p-4 border-t border-slate-800 bg-slate-900">
                    <form onSubmit={handleSendMessage} className="relative">
                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="Ask DeepGuard about this threat..."
                            className="w-full bg-slate-800 text-white placeholder-slate-500 rounded-lg pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-neon-blue border border-slate-700"
                        />
                        <button 
                            type="submit"
                            disabled={!chatInput.trim() || isAgentTyping}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 text-neon-blue hover:bg-neon-blue/10 rounded-md disabled:opacity-50"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

const AlertTriangleIcon = ({ risk }: { risk: string }) => {
    const color = risk === 'SAFE' ? 'text-slate-500' : 'text-neon-yellow';
    return <Zap className={`w-4 h-4 mt-0.5 ${color} shrink-0`} />;
}

export default DeepGuardPanel;