import { useState, useRef, useCallback, useMemo } from 'react';
import UnifiedCanvas from '@/components/simulation/UnifiedCanvas';
import UnifiedControls from '@/components/simulation/UnifiedControls';
import DataPanel from '@/components/simulation/DataPanel';
import MotionGraphs from '@/components/simulation/MotionGraphs';
import PhaseSpace from '@/components/simulation/PhaseSpace';
import { SimulationMode, DataPoint } from '@/types/simulation';

const MODES: { id: SimulationMode; label: string; desc: string }[] = [
  { id: 'simple', label: 'Simple', desc: 'Simple Harmonic Motion' },
  { id: 'double', label: 'Double', desc: 'Chaotic Double Pendulum' },
  { id: 'damped', label: 'Damped', desc: 'Damped & Driven Oscillator' },
  { id: 'spring', label: 'Spring', desc: 'Mass-Spring System' },
];

const Index = () => {
  const [mode, setMode] = useState<SimulationMode>('simple');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTrail, setShowTrail] = useState(true);
  const [showChaosComparison, setShowChaosComparison] = useState(true);

  // Parameters
  const [params, setParams] = useState({
    length: 1.5,
    length2: 1.0,
    mass: 1,
    mass2: 1,
    gravity: 9.81,
    angle: Math.PI / 3,
    angle2: Math.PI / 4,
    damping: 0.1,
    drivingFrequency: 2.0,
    drivingAmplitude: 0.5,
    springConstant: 20,
    displacement: 0.5,
  });

  // State
  const [state, setState] = useState({
    angle: params.angle,
    velocity: 0,
    angle2: params.angle2,
    velocity2: 0,
    displacement: params.displacement,
  });

  // Second pendulum state (for chaos comparison)
  const [state2, setState2] = useState({
    angle: params.angle,
    velocity: 0,
    angle2: params.angle2,
    velocity2: 0,
  });

  // Data history
  const [dataHistory, setDataHistory] = useState<DataPoint[]>([]);
  const [phaseData, setPhaseData] = useState<Array<{ angle: number; velocity: number; time: number }>>([]);
  const [phaseData2, setPhaseData2] = useState<Array<{ angle: number; velocity: number; time: number }>>([]);
  
  const timeRef = useRef(0);
  const lastUpdateRef = useRef(0);
  const angularVelocityRef = useRef(0);

  const handleParamChange = (key: string, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  const calculateEnergy = useCallback((angle: number, velocity: number) => {
    if (mode === 'spring') {
      const x = angle; // displacement for spring
      const v = velocity;
      const ke = 0.5 * params.mass * v * v;
      const pe = 0.5 * params.springConstant * x * x;
      return { ke, pe };
    }
    const h = params.length * (1 - Math.cos(angle));
    const pe = params.mass * params.gravity * h;
    const ke = 0.5 * params.mass * Math.pow(params.length * velocity, 2);
    return { ke, pe };
  }, [mode, params]);

  const handleSimpleUpdate = useCallback((angle: number, velocity: number) => {
    setState(prev => ({ ...prev, angle, velocity }));
    
    const now = performance.now();
    const dt = (now - lastUpdateRef.current) / 1000;
    lastUpdateRef.current = now;
    timeRef.current += dt;

    const { ke, pe } = calculateEnergy(angle, velocity);

    setDataHistory(prev => {
      const entry: DataPoint = { time: timeRef.current, angle, velocity, ke, pe };
      return [...prev.slice(-500), entry];
    });

    setPhaseData(prev => [...prev.slice(-500), { angle, velocity, time: timeRef.current }]);
  }, [calculateEnergy]);

  const handleDoubleUpdate = useCallback((s: { angle1: number; angle2: number; velocity1: number; velocity2: number }) => {
    setState(prev => ({ 
      ...prev, 
      angle: s.angle1, 
      velocity: s.velocity1,
      angle2: s.angle2,
      velocity2: s.velocity2,
    }));

    const now = performance.now();
    const dt = (now - lastUpdateRef.current) / 1000;
    lastUpdateRef.current = now;
    timeRef.current += dt;

    const { ke, pe } = calculateEnergy(s.angle1, s.velocity1);

    setDataHistory(prev => {
      const entry: DataPoint = { 
        time: timeRef.current, 
        angle: s.angle1, 
        velocity: s.velocity1, 
        ke, pe,
        angle2: s.angle2,
        velocity2: s.velocity2,
      };
      return [...prev.slice(-500), entry];
    });

    setPhaseData(prev => [...prev.slice(-500), { angle: s.angle2, velocity: s.velocity2, time: timeRef.current }]);
  }, [calculateEnergy]);

  const handleDouble2Update = useCallback((s: { angle1: number; angle2: number; velocity1: number; velocity2: number }) => {
    setState2({ 
      angle: s.angle1, 
      velocity: s.velocity1,
      angle2: s.angle2,
      velocity2: s.velocity2,
    });
    setPhaseData2(prev => [...prev.slice(-500), { angle: s.angle2, velocity: s.velocity2, time: timeRef.current }]);
  }, []);

  const handleDampedUpdate = useCallback((angle: number, velocity: number) => {
    setState(prev => ({ ...prev, angle, velocity }));

    const now = performance.now();
    const dt = (now - lastUpdateRef.current) / 1000;
    lastUpdateRef.current = now;
    timeRef.current += dt;

    const { ke, pe } = calculateEnergy(angle, velocity);

    setDataHistory(prev => {
      const entry: DataPoint = { time: timeRef.current, angle, velocity, ke, pe };
      return [...prev.slice(-500), entry];
    });

    setPhaseData(prev => [...prev.slice(-500), { angle, velocity, time: timeRef.current }]);
  }, [calculateEnergy]);

  const handleSpringUpdate = useCallback((displacement: number, velocity: number) => {
    setState(prev => ({ ...prev, displacement, velocity, angle: displacement }));

    const now = performance.now();
    const dt = (now - lastUpdateRef.current) / 1000;
    lastUpdateRef.current = now;
    timeRef.current += dt;

    const { ke, pe } = calculateEnergy(displacement, velocity);

    setDataHistory(prev => {
      const entry: DataPoint = { time: timeRef.current, angle: displacement, velocity, ke, pe };
      return [...prev.slice(-500), entry];
    });

    setPhaseData(prev => [...prev.slice(-500), { angle: displacement, velocity, time: timeRef.current }]);
  }, [calculateEnergy]);

  const handlePlayPause = () => {
    if (!isPlaying) {
      lastUpdateRef.current = performance.now();
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setState({
      angle: params.angle,
      velocity: 0,
      angle2: params.angle2,
      velocity2: 0,
      displacement: params.displacement,
    });
    setState2({
      angle: params.angle,
      velocity: 0,
      angle2: params.angle2,
      velocity2: 0,
    });
    angularVelocityRef.current = 0;
    timeRef.current = 0;
    setDataHistory([]);
    setPhaseData([]);
    setPhaseData2([]);
  };

  const handleModeChange = (newMode: SimulationMode) => {
    setIsPlaying(false);
    setMode(newMode);
    handleReset();
  };

  const currentModeInfo = MODES.find(m => m.id === mode);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Physics Simulation Lab
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {currentModeInfo?.desc}
              </p>
            </div>
            
            {/* Mode tabs */}
            <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleModeChange(m.id)}
                  className={`mode-tab ${mode === m.id ? 'mode-tab-active' : 'mode-tab-inactive'}`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-12 gap-4">
          {/* Controls */}
          <aside className="col-span-12 lg:col-span-3">
            <UnifiedControls
              mode={mode}
              params={params}
              isPlaying={isPlaying}
              showTrail={showTrail}
              showChaosComparison={showChaosComparison}
              onParamChange={handleParamChange}
              onPlayPause={handlePlayPause}
              onReset={handleReset}
              onTrailToggle={setShowTrail}
              onChaosToggle={setShowChaosComparison}
            />
          </aside>

          {/* Canvas */}
          <section className="col-span-12 lg:col-span-6">
            <div className="h-[400px] lg:h-[450px]">
              <UnifiedCanvas
                mode={mode}
                params={params}
                isPlaying={isPlaying}
                showTrail={showTrail}
                onSimpleUpdate={handleSimpleUpdate}
                onDoubleUpdate={handleDoubleUpdate}
                onDouble2Update={handleDouble2Update}
                onDampedUpdate={handleDampedUpdate}
                onSpringUpdate={handleSpringUpdate}
                angularVelocityRef={angularVelocityRef}
                showChaosComparison={showChaosComparison}
              />
            </div>

            {/* Phase space below canvas */}
            <div className="panel mt-4">
              <div className="panel-body">
                <PhaseSpace 
                  data={phaseData} 
                  data2={mode === 'double' && showChaosComparison ? phaseData2 : undefined}
                  title={mode === 'spring' ? 'Phase Space (x vs v)' : 'Phase Space (θ vs ω)'}
                />
              </div>
            </div>
          </section>

          {/* Data & Graphs */}
          <aside className="col-span-12 lg:col-span-3 space-y-4">
            <DataPanel
              mode={mode}
              state={state}
              params={params}
              isPlaying={isPlaying}
            />
            
            <div className="panel">
              <div className="panel-header">
                <h3 className="font-semibold text-sm">Motion Graphs</h3>
              </div>
              <div className="panel-body">
                <MotionGraphs 
                  data={dataHistory} 
                  showComparison={mode === 'double' && showChaosComparison}
                />
              </div>
            </div>
          </aside>
        </div>

        {/* Info footer */}
        {mode === 'double' && showChaosComparison && (
          <div className="mt-4 panel">
            <div className="panel-body">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-foreground">Chaos Sensitivity Analysis</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    The red pendulum starts with a 0.001 radian (~0.06°) difference. Watch how this tiny change 
                    leads to completely different trajectories over time — a hallmark of chaotic systems.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {mode === 'damped' && params.drivingAmplitude > 0 && (
          <div className="mt-4 panel">
            <div className="panel-body">
              <div className="text-sm">
                <p className="font-medium text-foreground">Resonance Detection</p>
                <p className="text-muted-foreground text-xs mt-1">
                  Natural frequency: <span className="data-value">{Math.sqrt(params.gravity / params.length).toFixed(2)} rad/s</span>. 
                  When driving frequency approaches this value, observe resonance (bob turns red).
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
