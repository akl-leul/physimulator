import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

interface MotionGraphsProps {
  data: Array<{
    time: number;
    angle: number;
    velocity: number;
    ke: number;
    pe: number;
    angle2?: number;
    velocity2?: number;
  }>;
  showComparison?: boolean;
}

const MotionGraphs = ({ data, showComparison = false }: MotionGraphsProps) => {
  const displayData = useMemo(() => {
    return data.slice(-200).map(d => ({
      ...d,
      angleDeg: (d.angle * 180 / Math.PI),
      angleDeg2: d.angle2 ? (d.angle2 * 180 / Math.PI) : undefined,
    }));
  }, [data]);

  return (
    <div className="space-y-4">
      {/* Displacement Graph */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="label">Displacement</span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-2 h-0.5 bg-primary rounded" />
              θ
            </span>
            {showComparison && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-0.5 bg-rose-500 rounded" />
                θ₂
              </span>
            )}
          </div>
        </div>
        <div className="h-28 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={displayData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" />
              <XAxis 
                dataKey="time" 
                tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 9 }}
                tickFormatter={(v) => v.toFixed(1)}
                stroke="hsl(214, 20%, 88%)"
              />
              <YAxis 
                tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 9 }}
                stroke="hsl(214, 20%, 88%)"
              />
              <Line
                type="monotone"
                dataKey="angleDeg"
                stroke="#0891b2"
                dot={false}
                strokeWidth={1.5}
                isAnimationActive={false}
              />
              {showComparison && (
                <Line
                  type="monotone"
                  dataKey="angleDeg2"
                  stroke="#f43f5e"
                  dot={false}
                  strokeWidth={1.5}
                  isAnimationActive={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Energy Graph */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="label">Energy</span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-2 h-0.5 bg-blue-500 rounded" />
              KE
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-0.5 bg-amber-500 rounded" />
              PE
            </span>
          </div>
        </div>
        <div className="h-28 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={displayData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" />
              <XAxis 
                dataKey="time" 
                tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 9 }}
                tickFormatter={(v) => v.toFixed(1)}
                stroke="hsl(214, 20%, 88%)"
              />
              <YAxis 
                tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 9 }}
                stroke="hsl(214, 20%, 88%)"
              />
              <Line
                type="monotone"
                dataKey="ke"
                stroke="#3b82f6"
                dot={false}
                strokeWidth={1.5}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="pe"
                stroke="#f59e0b"
                dot={false}
                strokeWidth={1.5}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MotionGraphs;
