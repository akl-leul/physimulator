import { SimulationMode } from '@/types/simulation';

interface DataPanelProps {
  mode: SimulationMode;
  state: {
    angle: number;
    velocity: number;
    angle2?: number;
    velocity2?: number;
    displacement?: number;
  };
  params: {
    length: number;
    length2: number;
    mass: number;
    mass2: number;
    gravity: number;
    springConstant: number;
  };
  isPlaying: boolean;
}

const DataPanel = ({ mode, state, params, isPlaying }: DataPanelProps) => {
  const radToDeg = (rad: number) => ((rad * 180 / Math.PI) % 360).toFixed(1);

  // Energy calculations based on mode
  const calculateEnergy = () => {
    if (mode === 'spring') {
      const x = state.displacement || 0;
      const v = state.velocity;
      const k = params.springConstant;
      const m = params.mass;
      const ke = 0.5 * m * v * v;
      const pe = 0.5 * k * x * x;
      return { ke, pe, total: ke + pe };
    } else {
      const h = params.length * (1 - Math.cos(state.angle));
      const pe = params.mass * params.gravity * h;
      const ke = 0.5 * params.mass * Math.pow(params.length * state.velocity, 2);
      return { ke, pe, total: ke + pe };
    }
  };

  const energy = calculateEnergy();
  
  // Period calculation
  const getPeriod = () => {
    if (mode === 'spring') {
      return 2 * Math.PI * Math.sqrt(params.mass / params.springConstant);
    }
    return 2 * Math.PI * Math.sqrt(params.length / params.gravity);
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <h3 className="font-semibold text-sm">Live Data</h3>
        <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-500' : 'bg-muted'}`} />
      </div>
      <div className="panel-body space-y-4">
        {/* Primary state */}
        <div className="grid grid-cols-2 gap-3">
          {mode === 'spring' ? (
            <>
              <div className="stat-card">
                <span className="label block">Displacement</span>
                <span className="data-value text-lg">{(state.displacement || 0).toFixed(3)} m</span>
              </div>
              <div className="stat-card">
                <span className="label block">Velocity</span>
                <span className="data-value text-lg">{state.velocity.toFixed(2)} m/s</span>
              </div>
            </>
          ) : (
            <>
              <div className="stat-card">
                <span className="label block">Angle (θ)</span>
                <span className="data-value text-lg">{radToDeg(state.angle)}°</span>
              </div>
              <div className="stat-card">
                <span className="label block">Angular Vel (ω)</span>
                <span className="data-value text-lg">{state.velocity.toFixed(2)}</span>
              </div>
            </>
          )}
        </div>

        {/* Second pendulum for double/coupled mode */}
        {(mode === 'double' || mode === 'coupled') && state.angle2 !== undefined && (
          <div className="grid grid-cols-2 gap-3">
            <div className="stat-card">
              <span className="label block">Angle 2 (θ₂)</span>
              <span className="data-value text-lg">{radToDeg(state.angle2)}°</span>
            </div>
            <div className="stat-card">
              <span className="label block">Angular Vel 2</span>
              <span className="data-value text-lg">{(state.velocity2 || 0).toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Derived values */}
        <div className="border-t border-border pt-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Period (T)</span>
            <span className="data-value">{getPeriod().toFixed(3)} s</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Frequency</span>
            <span className="data-value">{(1 / getPeriod()).toFixed(3)} Hz</span>
          </div>
        </div>

        {/* Energy */}
        <div className="border-t border-border pt-3 space-y-3">
          <span className="label">Energy</span>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-blue-600">Kinetic (KE)</span>
              <span className="data-value">{energy.ke.toFixed(3)} J</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-75"
                style={{ width: `${energy.total > 0 ? (energy.ke / energy.total) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-amber-600">Potential (PE)</span>
              <span className="data-value">{energy.pe.toFixed(3)} J</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-500 transition-all duration-75"
                style={{ width: `${energy.total > 0 ? (energy.pe / energy.total) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="flex justify-between text-xs pt-1 border-t border-border/50">
            <span className="text-muted-foreground">Total</span>
            <span className="data-value">{energy.total.toFixed(3)} J</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataPanel;
