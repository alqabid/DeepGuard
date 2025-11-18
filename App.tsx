import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import DeepGuardPanel from './components/DeepGuardPanel';
import ThreatMonitor from './components/ThreatMonitor';
import Incidents from './components/Incidents';
import Settings from './components/Settings';
import { MOCK_MESSAGES } from './constants';
import { Message, AnalysisResult } from './types';
import { analyzeMessage } from './services/geminiService';
import { Search, Mail, Phone, ChevronRight, Menu } from 'lucide-react';

const App = () => {
  const [currentView, setCurrentView] = useState('inbox');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSelectMessage = async (msg: Message) => {
    setSelectedMessage(msg);
    setAnalyzing(true);
    setAnalysis(null); // Reset previous analysis

    try {
       const result = await analyzeMessage(msg.subject, msg.content, msg.senderEmail);
       setAnalysis(result);
    } catch (e) {
       console.error(e);
    } finally {
       setAnalyzing(false);
    }
  };

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    // Reset selection when changing main views to ensure list is visible on mobile
    if (view !== 'inbox') {
        setSelectedMessage(null);
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-200 overflow-hidden font-sans selection:bg-neon-green/30">
      <Sidebar 
        currentView={currentView} 
        onNavigate={handleNavigate}
        isMobileOpen={mobileMenuOpen}
        closeMobileMenu={() => setMobileMenuOpen(false)}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 relative">
        
        {/* Mobile Header */}
        <div className="md:hidden h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 flex-shrink-0">
           <span className="font-bold text-lg text-white flex items-center gap-2">
             <span className="w-3 h-3 rounded-full bg-neon-green"></span> DeepGuard
           </span>
           <button onClick={() => setMobileMenuOpen(true)} className="text-slate-400 p-2">
             <Menu />
           </button>
        </div>

        {currentView === 'inbox' && (
          <>
            {/* Search Bar - Only show when not viewing a specific message on mobile or always on desktop */}
            <div className={`${selectedMessage ? 'hidden lg:flex' : 'flex'} h-16 bg-slate-900/50 border-b border-slate-800 items-center px-6 gap-4 flex-shrink-0`}>
              <Search className="w-5 h-5 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search communications..." 
                className="bg-transparent border-none focus:outline-none text-slate-200 placeholder-slate-500 w-full"
              />
              <div className="flex items-center gap-2 whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse"></span>
                <span className="text-xs font-mono text-neon-green hidden sm:block">SYSTEM ACTIVE</span>
              </div>
            </div>

            <div className="flex flex-1 overflow-hidden relative">
              {/* Inbox List */}
              <div className={`${selectedMessage ? 'hidden lg:block' : 'block'} w-full lg:w-2/5 xl:w-1/3 bg-slate-900/30 border-r border-slate-800 overflow-y-auto`}>
                <div className="p-4">
                  <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Recent Messages</h2>
                  <div className="space-y-2">
                    {MOCK_MESSAGES.map((msg) => (
                      <div 
                        key={msg.id}
                        onClick={() => handleSelectMessage(msg)}
                        className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                          selectedMessage?.id === msg.id 
                          ? 'bg-slate-800 border-neon-blue/50 shadow-lg shadow-neon-blue/5' 
                          : 'bg-slate-900/40 border-transparent hover:bg-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center gap-2">
                             {msg.type === 'voice' ? <Phone className="w-4 h-4 text-neon-yellow" /> : <Mail className="w-4 h-4 text-slate-400" />}
                             <span className={`font-semibold text-sm ${selectedMessage?.id === msg.id ? 'text-white' : 'text-slate-200'}`}>
                               {msg.sender}
                             </span>
                          </div>
                          <span className="text-xs text-slate-500">{msg.timestamp}</span>
                        </div>
                        <div className="text-xs text-slate-500 mb-2 font-mono truncate">{msg.senderEmail}</div>
                        <div className="text-sm text-slate-300 font-medium truncate mb-1">{msg.subject}</div>
                        <p className="text-xs text-slate-500 line-clamp-2">{msg.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Message Detail View */}
              <div className={`${!selectedMessage ? 'hidden lg:flex' : 'flex'} flex-col flex-1 bg-slate-950 relative overflow-hidden`}>
                 {selectedMessage ? (
                   <>
                    {/* Mobile back button */}
                    <div className="lg:hidden p-4 border-b border-slate-800 flex items-center gap-2 text-slate-400 cursor-pointer bg-slate-900" onClick={() => setSelectedMessage(null)}>
                       <ChevronRight className="rotate-180 w-5 h-5" /> Back to Inbox
                    </div>

                    <div className="p-6 md:p-8 overflow-y-auto flex-1">
                       <div className="flex justify-between items-start mb-6">
                          <div>
                            <h1 className="text-2xl font-bold text-white mb-2">{selectedMessage.subject}</h1>
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white font-bold">
                                  {selectedMessage.sender.charAt(0)}
                               </div>
                               <div>
                                  <div className="font-semibold text-white">{selectedMessage.sender}</div>
                                  <div className="text-sm text-slate-400 font-mono">{selectedMessage.senderEmail}</div>
                               </div>
                            </div>
                          </div>
                          <div className="text-sm text-slate-500">{selectedMessage.timestamp}</div>
                       </div>

                       <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 text-slate-300 leading-relaxed whitespace-pre-line font-light">
                          {selectedMessage.content}
                          
                          {selectedMessage.type === 'voice' && (
                            <div className="mt-6 p-4 bg-slate-800 rounded-lg border border-slate-700 flex items-center gap-4">
                               <div className="w-10 h-10 rounded-full bg-neon-yellow/10 flex items-center justify-center">
                                  <Phone className="w-5 h-5 text-neon-yellow" />
                               </div>
                               <div className="flex-1">
                                  <div className="h-1 bg-slate-700 rounded-full w-full overflow-hidden">
                                     <div className="h-full w-1/3 bg-neon-yellow"></div>
                                  </div>
                                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                                     <span>0:12</span>
                                     <span>0:45</span>
                                  </div>
                               </div>
                            </div>
                          )}
                       </div>
                    </div>
                   </>
                 ) : (
                   <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
                     <Mail className="w-16 h-16 mb-4 opacity-20" />
                     <p>Select a conversation to analyze.</p>
                   </div>
                 )}
              </div>

              {/* Right Panel: DeepGuard AI */}
              <div className={`${selectedMessage ? 'block' : 'hidden'} w-full md:w-96 lg:w-[400px] fixed inset-y-0 right-0 lg:static lg:inset-auto z-20 lg:z-auto shadow-2xl lg:shadow-none transform transition-transform duration-300 ${selectedMessage ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'} bg-slate-900`}>
                 {/* Mobile Close Panel Button (only visible on mobile when panel is open) */}
                 <div className="lg:hidden absolute top-4 right-4 z-30">
                    <button onClick={() => setSelectedMessage(null)} className="p-2 bg-slate-800 rounded-full text-slate-400">
                        <ChevronRight className="w-6 h-6" />
                    </button>
                 </div>
                 
                 <DeepGuardPanel 
                    analysis={analysis} 
                    loading={analyzing} 
                    selectedMessage={selectedMessage}
                    messageContent={selectedMessage?.content || ''}
                 />
              </div>
            </div>
          </>
        )}

        {currentView === 'monitor' && <ThreatMonitor />}
        {currentView === 'incidents' && <Incidents />}
        {currentView === 'settings' && <Settings />}
      </div>
    </div>
  );
};

export default App;