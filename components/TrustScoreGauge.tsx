import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface TrustScoreGaugeProps {
  score: number;
}

const TrustScoreGauge: React.FC<TrustScoreGaugeProps> = ({ score }) => {
  const data = [
    { name: 'Score', value: score },
    { name: 'Remaining', value: 100 - score },
  ];

  let color = '#10b981'; // Green
  if (score < 50) color = '#ef4444'; // Red
  else if (score < 80) color = '#eab308'; // Yellow

  return (
    <div className="relative w-32 h-32 mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={35}
            outerRadius={50}
            startAngle={180}
            endAngle={0}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            <Cell key="cell-0" fill={color} />
            <Cell key="cell-1" fill="#334155" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1 text-center mt-2">
        <div className="text-2xl font-bold text-white">{score}</div>
        <div className="text-[10px] uppercase tracking-wider text-slate-400">Trust Score</div>
      </div>
    </div>
  );
};

export default TrustScoreGauge;