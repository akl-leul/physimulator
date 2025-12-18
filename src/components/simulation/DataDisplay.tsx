import { useMemo } from 'react';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface DataDisplayProps {
  angle: number;
  angularVelocity: number;
  length: number;
  mass: number;
  gravity: number;
  isPlaying: boolean;
}

const DataDisplay = ({
  angle,
  angularVelocity,
  length,
  mass,
  gravity,
  isPlaying,
}: DataDisplayProps) => {
  const calculations = useMemo(() => {
    // Period for simple pendulum (small angle approximation)
    const period = 2 * Math.PI * Math.sqrt(length / gravity);
    const frequency = 1 / period;
    
    // Current height of bob from lowest point
    const height = length * (1 - Math.cos(angle));
    
    // Energy calculations
    const potentialEnergy = mass * gravity * height;
    const kineticEnergy = 0.5 * mass * Math.pow(length * angularVelocity, 2);
    const totalEnergy = potentialEnergy + kineticEnergy;
    
    // Linear velocity at the bob
    const linearVelocity = length * angularVelocity;
    
    return {
      period,
      frequency,
      height,
      potentialEnergy,
      kineticEnergy,
      totalEnergy,
      linearVelocity,
    };
  }, [angle, angularVelocity, length, mass, gravity]);

  const formatNumber = (num: number, decimals: number = 3) => {
    return num.toFixed(decimals);
  };

  const radToDeg = (rad: number) => (rad * 180 / Math.PI).toFixed(1);

  return (
    <div className="glass-panel p-6 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-foreground">Live Data</h2>
        <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-success animate-pulse' : 'bg-muted-foreground'}`} />
      </div>

      {/* Primary Measurements */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <span className="parameter-label">Angle</span>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-3 h-3 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Current angular displacement from equilibrium</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="data-readout text-xl">{radToDeg(angle)}°</p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <span className="parameter-label">Angular Velocity</span>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-3 h-3 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Rate of change of angle (ω = dθ/dt)</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="data-readout text-xl">{formatNumber(angularVelocity, 2)} rad/s</p>
        </div>
      </div>

      {/* Derived Values */}
      <div className="pt-4 border-t border-border space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1">
            <span className="parameter-label">Period (T)</span>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-3 h-3 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>T = 2π√(L/g) - Time for one complete oscillation</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <span className="data-readout">{formatNumber(calculations.period)} s</span>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1">
            <span className="parameter-label">Frequency (f)</span>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-3 h-3 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>f = 1/T - Oscillations per second</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <span className="data-readout">{formatNumber(calculations.frequency)} Hz</span>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1">
            <span className="parameter-label">Linear Velocity</span>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-3 h-3 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>v = L × ω - Tangential velocity of the bob</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <span className="data-readout">{formatNumber(Math.abs(calculations.linearVelocity), 2)} m/s</span>
        </div>
      </div>

      {/* Energy Display */}
      <div className="pt-4 border-t border-border space-y-3">
        <h3 className="parameter-label text-sm">Energy Analysis</h3>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-energy-kinetic">Kinetic (KE)</span>
            <span className="data-readout text-sm">{formatNumber(calculations.kineticEnergy)} J</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-energy-kinetic transition-all duration-100"
              style={{ 
                width: `${calculations.totalEnergy > 0 ? (calculations.kineticEnergy / calculations.totalEnergy) * 100 : 0}%` 
              }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-energy-potential">Potential (PE)</span>
            <span className="data-readout text-sm">{formatNumber(calculations.potentialEnergy)} J</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-energy-potential transition-all duration-100"
              style={{ 
                width: `${calculations.totalEnergy > 0 ? (calculations.potentialEnergy / calculations.totalEnergy) * 100 : 0}%` 
              }}
            />
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-border/50">
          <span className="parameter-label">Total Energy</span>
          <span className="data-readout">{formatNumber(calculations.totalEnergy)} J</span>
        </div>
      </div>
    </div>
  );
};

export default DataDisplay;
