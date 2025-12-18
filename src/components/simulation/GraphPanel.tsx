import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from 'recharts';

interface GraphPanelProps {
  dataHistory: Array<{
    time: number;
    angle: number;
    velocity: number;
    ke: number;
    pe: number;
  }>;
}

const GraphPanel = ({ dataHistory }: GraphPanelProps) => {
  const displayData = useMemo(() => {
    // Show last 200 data points for smooth animation
    const data = dataHistory.slice(-200);
    return data.map(d => ({
      ...d,
      angleDeg: d.angle * 180 / Math.PI,
    }));
  }, [dataHistory]);

  const chartConfig = {
    angle: {
      stroke: "#22d3ee",
      name: "Angle (°)",
    },
    velocity: {
      stroke: "#14b8a6",
      name: "ω (rad/s)",
    },
    ke: {
      stroke: "#22d3ee",
      name: "KE",
    },
    pe: {
      stroke: "#eab308",
      name: "PE",
    },
  };

  return (
    <div className="glass-panel p-4 space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Motion Graphs</h2>
      
      {/* Displacement Graph */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="parameter-label">Displacement vs Time</span>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-primary rounded" />
              θ (°)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-accent rounded" />
              ω (rad/s)
            </span>
          </div>
        </div>
        <div className="h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={displayData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 18%)" />
              <XAxis 
                dataKey="time" 
                tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 10 }}
                tickFormatter={(v) => v.toFixed(1)}
                stroke="hsl(217, 33%, 18%)"
              />
              <YAxis 
                tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 10 }}
                stroke="hsl(217, 33%, 18%)"
                domain={[-100, 100]}
              />
              <ReferenceLine y={0} stroke="hsl(217, 33%, 25%)" />
              <Line
                type="monotone"
                dataKey="angleDeg"
                stroke={chartConfig.angle.stroke}
                dot={false}
                strokeWidth={2}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="velocity"
                stroke={chartConfig.velocity.stroke}
                dot={false}
                strokeWidth={1.5}
                opacity={0.7}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Energy Graph */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="parameter-label">Energy vs Time</span>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-primary rounded" />
              KE
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-energy-potential rounded" />
              PE
            </span>
          </div>
        </div>
        <div className="h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={displayData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 18%)" />
              <XAxis 
                dataKey="time" 
                tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 10 }}
                tickFormatter={(v) => v.toFixed(1)}
                stroke="hsl(217, 33%, 18%)"
              />
              <YAxis 
                tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 10 }}
                stroke="hsl(217, 33%, 18%)"
              />
              <Line
                type="monotone"
                dataKey="ke"
                stroke={chartConfig.ke.stroke}
                dot={false}
                strokeWidth={2}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="pe"
                stroke={chartConfig.pe.stroke}
                dot={false}
                strokeWidth={2}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default GraphPanel;
