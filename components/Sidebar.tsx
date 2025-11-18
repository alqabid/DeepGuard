import React from 'react';
import { ShieldCheck, Inbox, AlertTriangle, Settings, Activity, X } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isMobileOpen?: boolean;
  closeMobileMenu?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, isMobileOpen = false, closeMobileMenu }) => {
  const navItems = [
    { id: 'inbox', label: 'Inbox Protection', icon: Inbox },
    { id: 'monitor', label: 'Threat Monitor', icon: Activity },
    { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
  ];

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-slate-900">
      <div>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center">
            <ShieldCheck className="w-8 h-8 text-neon-green" />
            <span className="ml-3 font-bold text-xl tracking-tight text-white">DeepGuard</span>
          </div>
          {closeMobileMenu && (
            <button onClick={closeMobileMenu} className="md:hidden text-slate-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
        
        <nav className="mt-8 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  if (closeMobileMenu) closeMobileMenu();
                }}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-slate-800 text-white shadow-lg shadow-neon-blue/10 border border-slate-700' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <item.icon className={`w-6 h-6 ${isActive ? 'text-neon-blue' : 'group-hover:text-slate-200'}`} />
                <span className="ml-3 font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-4">
        <button
          onClick={() => {
            onNavigate('settings');
            if (closeMobileMenu) closeMobileMenu();
          }}
          className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
            currentView === 'settings'
              ? 'bg-slate-800 text-white shadow-lg shadow-neon-blue/10 border border-slate-700' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
          }`}
        >
          <Settings className={`w-6 h-6 ${currentView === 'settings' ? 'text-neon-blue' : 'group-hover:text-slate-200'}`} />
          <span className="ml-3 font-medium">Settings</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 h-screen bg-slate-900 border-r border-slate-800 flex-shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={closeMobileMenu}></div>
          <div className="relative w-64 h-full shadow-2xl animate-in slide-in-from-left duration-300">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;