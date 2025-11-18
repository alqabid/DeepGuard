import React from 'react';
import { AlertTriangle, CheckCircle, XCircle, ExternalLink, Download } from 'lucide-react';

const incidents = [
  { id: 'INC-2024-001', date: '2024-03-15', source: 'finance-dept@internal-update.com', type: 'Phishing', severity: 'High', status: 'Blocked' },
  { id: 'INC-2024-002', date: '2024-03-14', source: 'ceo-urgent@gmail.com', type: 'CEO Fraud', severity: 'Critical', status: 'Blocked' },
  { id: 'INC-2024-003', date: '2024-03-12', source: 'unknown-caller (+1 555-0123)', type: 'Deepfake Voice', severity: 'Medium', status: 'Flagged' },
  { id: 'INC-2024-004', date: '2024-03-10', source: 'vendor-invoices@quickbooks-secure.net', type: 'Malware Link', severity: 'High', status: 'Blocked' },
  { id: 'INC-2024-005', date: '2024-03-08', source: 'hr-payroll@payroll-service-portal.com', type: 'Cred Harvesting', severity: 'Low', status: 'Monitored' },
];

const Incidents = () => {
  return (
    <div className="flex-1 h-full overflow-y-auto bg-slate-950 p-6 md:p-10">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Security Incidents</h1>
          <p className="text-slate-400">Audit log of all detected and mitigated threats.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition-colors text-sm">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800">
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">ID</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Source</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Type</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Severity</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {incidents.map((incident) => (
                <tr key={incident.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-sm font-mono text-slate-500">{incident.id}</td>
                  <td className="p-4 text-sm text-slate-300">{incident.date}</td>
                  <td className="p-4 text-sm text-white font-medium">
                    <div className="truncate w-48 lg:w-64" title={incident.source}>{incident.source}</div>
                  </td>
                  <td className="p-4 text-sm text-slate-300">{incident.type}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${incident.severity === 'Critical' ? 'bg-neon-red/10 text-neon-red border border-neon-red/20' : 
                        incident.severity === 'High' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' : 
                        incident.severity === 'Medium' ? 'bg-neon-yellow/10 text-neon-yellow border border-neon-yellow/20' : 
                        'bg-neon-blue/10 text-neon-blue border border-neon-blue/20'}`}>
                      {incident.severity}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {incident.status === 'Blocked' ? <CheckCircle className="w-4 h-4 text-neon-green" /> : <AlertTriangle className="w-4 h-4 text-neon-yellow" />}
                      <span className="text-sm text-slate-300">{incident.status}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <button className="text-neon-blue hover:text-white transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Incidents;