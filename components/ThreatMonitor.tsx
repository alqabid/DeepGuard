import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { ShieldAlert, Activity, Lock, TrendingUp } from 'lucide-react';

const data = [
  { name: 'Mon', threats: 2, prevented: 2 },
  { name: 'Tue', threats: 5, prevented: 4 },
  { name: 'Wed', threats: 3, prevented: 3 },
  { name: 'Thu', threats: 8, prevented: 7 },
  { name: 'Fri', threats: 12, prevented: 11 },
  { name: 'Sat', threats: 4, prevented: 4 },
  { name: 'Sun', threats: 6, prevented: 6 },
];

const attackTypes = [
  { name: 'Phishing', value: 45 },
  { name: 'CEO Fraud', value: 25 },
  { name: 'Deepfake', value: 20 },
  { name: 'Malware', value: 10 },
];

const ThreatMonitor = () => {
  return (
    <div className="flex-1 h-full overflow-y-auto bg-slate-950 p-6 md:p-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Threat Monitor</h1>
        <p className="text-slate-400">Real-time analysis of prevented security incidents.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 font-medium">Threats Blocked</h3>
            <ShieldAlert className="text-neon-green w-5 h-5" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">142</div>
          <div className="text-sm text-neon-green flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +12% this week
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 font-medium">Active Scans</h3>
            <Activity className="text-neon-blue w-5 h-5" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">1,204</div>
          <div className="text-sm text-slate-500">Messages processed today</div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-400 font-medium">Est. Savings</h3>
            <Lock className="text-neon-yellow w-5 h-5" />
          </div>
          <div className="text-3xl font-bold text-white mb-1">$45k</div>
          <div className="text-sm text-slate-500">Based on average breach cost</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl h-[400px]">
          <h3 className="text-lg font-bold text-white mb-6">Activity Timeline</h3>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPrevented" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }}
                itemStyle={{ color: '#f1f5f9' }}
              />
              <Area type="monotone" dataKey="threats" stroke="#3b82f6" fillOpacity={1} fill="url(#colorThreats)" />
              <Area type="monotone" dataKey="prevented" stroke="#10b981" fillOpacity={1} fill="url(#colorPrevented)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl h-[400px]">
          <h3 className="text-lg font-bold text-white mb-6">Attack Vectors</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={attackTypes} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis type="number" stroke="#64748b" />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" width={100} />
              <Tooltip 
                cursor={{fill: '#1e293b'}}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {attackTypes.map((entry, index) => (
                   <Cell key={`cell-${index}`} fill={['#ef4444', '#f59e0b', '#3b82f6', '#a855f7'][index % 4]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ThreatMonitor;