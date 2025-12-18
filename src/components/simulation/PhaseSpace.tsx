import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine, ScatterChart, Scatter } from 'recharts';

interface PhaseSpaceProps {
  data: Array<{
    angle: number;
    velocity: number;
    time: number;
  }>;
  data2?: Array<{
    angle: number;
    velocity: number;
    time: number;
  }>;
  title?: string;
}

const PhaseSpace = ({ data, data2, title = "Phase Space (θ vs ω)" }: PhaseSpaceProps) => {
  const displayData = useMemo(() => {
    return data.slice(-300).map(d => ({
      angle: (d.angle * 180 / Math.PI) % 360,
      velocity: d.velocity,
    }));
  }, [data]);

  const displayData2 = useMemo(() => {
    if (!data2) return null;
    return data2.slice(-300).map(d => ({
      angle: (d.angle * 180 / Math.PI) % 360,
      velocity: d.velocity,
    }));
  }, [data2]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="label">{title}</span>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-primary" />
            System 1
          </span>
          {data2 && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              System 2
            </span>
          )}
        </div>
      </div>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" />
            <XAxis 
              type="number"
              dataKey="angle" 
              name="θ"
              tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 10 }}
              stroke="hsl(214, 20%, 88%)"
              label={{ value: 'θ (°)', position: 'bottom', offset: 0, fontSize: 10, fill: 'hsl(215, 16%, 47%)' }}
              domain={['auto', 'auto']}
            />
            <YAxis 
              type="number"
              dataKey="velocity"
              name="ω"
              tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 10 }}
              stroke="hsl(214, 20%, 88%)"
              label={{ value: 'ω', angle: -90, position: 'insideLeft', fontSize: 10, fill: 'hsl(215, 16%, 47%)' }}
              domain={['auto', 'auto']}
            />
            <Scatter
              data={displayData}
              fill="#0891b2"
              line={{ stroke: '#0891b2', strokeWidth: 1 }}
              shape="circle"
              legendType="circle"
            />
            {displayData2 && (
              <Scatter
                data={displayData2}
                fill="#f43f5e"
                line={{ stroke: '#f43f5e', strokeWidth: 1 }}
                shape="circle"
              />
            )}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PhaseSpace;
