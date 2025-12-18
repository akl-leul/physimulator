import { useState, useRef, useCallback } from 'react';
import UnifiedCanvas from '@/components/simulation/UnifiedCanvas';
import UnifiedControls from '@/components/simulation/UnifiedControls';
import DataPanel from '@/components/simulation/DataPanel';
import MotionGraphs from '@/components/simulation/MotionGraphs';
import PhaseSpace from '@/components/simulation/PhaseSpace';
import PresetSelector from '@/components/simulation/PresetSelector';
import VideoExport from '@/components/simulation/VideoExport';
import { SimulationMode, DataPoint, Preset } from '@/types/simulation';
import { MODE_INFO } from '@/config/presets';

const MODES: SimulationMode[] = ['simple', 'double', 'damped', 'spring', 'coupled'];

const Index = () => {
  const [mode, setMode] = useState<SimulationMode>('simple');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTrail, setShowTrail] = useState(true);
  const [showChaosComparison, setShowChaosComparison] = useState(true);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

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

  const handlePresetSelect = (preset: Preset) => {
    setIsPlaying(false);
    setMode(preset.mode);
    
    // Apply preset params
    setParams(prev => ({
      ...prev,
      length: preset.params.length ?? prev.length,
      length2: preset.params.length2 ?? prev.length2,
      mass: preset.params.mass ?? prev.mass,
      mass2: preset.params.mass2 ?? prev.mass2,
      gravity: preset.params.gravity ?? prev.gravity,
      angle: preset.params.initialAngle ?? prev.angle,
      angle2: preset.params.initialAngle2 ?? prev.angle2,
      damping: preset.params.damping ?? prev.damping,
      drivingFrequency: preset.params.drivingFrequency ?? prev.drivingFrequency,
      drivingAmplitude: preset.params.drivingAmplitude ?? prev.drivingAmplitude,
      springConstant: preset.params.springConstant ?? prev.springConstant,
      displacement: preset.params.initialDisplacement ?? prev.displacement,
    }));

    // Reset state
    setTimeout(() => {
      handleReset();
    }, 50);
  };

  const calculateEnergy = useCallback((angle: number, velocity: number) => {
    if (mode === 'spring') {
      const x = angle;
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

  const handleCoupledUpdate = useCallback((s: { angle1: number; angle2: number; velocity1: number; velocity2: number }) => {
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

    setPhaseData(prev => [...prev.slice(-500), { angle: s.angle1, velocity: s.velocity1, time: timeRef.current }]);
    setPhaseData2(prev => [...prev.slice(-500), { angle: s.angle2, velocity: s.velocity2, time: timeRef.current }]);
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

  const currentModeInfo = MODE_INFO[mode];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Physics Simulation Lab
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {currentModeInfo.desc}
              </p>
            </div>
            
            {/* Mode tabs */}
            <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1">
              {MODES.map((m) => (
                <button
                  key={m}
                  onClick={() => handleModeChange(m)}
                  className={`mode-tab ${mode === m ? 'mode-tab-active' : 'mode-tab-inactive'}`}
                >
                  {MODE_INFO[m].label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid grid-cols-12 gap-4">
          {/* Left column - Controls & Presets */}
          <aside className="col-span-12 lg:col-span-3 space-y-4">
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
            <PresetSelector 
              currentMode={mode} 
              onSelectPreset={handlePresetSelect}
            />
          </aside>

          {/* Center - Canvas */}
          <section className="col-span-12 lg:col-span-6">
            <div className="panel overflow-hidden">
              <div className="panel-header">
                <span className="text-xs text-muted-foreground">3D Simulation</span>
                <VideoExport 
                  canvasContainerRef={canvasContainerRef}
                  isPlaying={isPlaying}
                />
              </div>
              <div ref={canvasContainerRef} className="h-[380px]">
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
                  onCoupledUpdate={handleCoupledUpdate}
                  angularVelocityRef={angularVelocityRef}
                  showChaosComparison={showChaosComparison}
                />
              </div>
            </div>

            {/* Phase space */}
            <div className="panel mt-4">
              <div className="panel-body">
                <PhaseSpace 
                  data={phaseData} 
                  data2={(mode === 'double' && showChaosComparison) || mode === 'coupled' ? phaseData2 : undefined}
                  title={mode === 'spring' ? 'Phase Space (x vs v)' : 'Phase Space (θ vs ω)'}
                />
              </div>
            </div>
          </section>

          {/* Right column - Data & Graphs */}
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
                  showComparison={(mode === 'double' && showChaosComparison) || mode === 'coupled'}
                />
              </div>
            </div>
          </aside>
        </div>

        {/* Info panels */}
        {mode === 'double' && showChaosComparison && (
          <div className="mt-4 panel">
            <div className="panel-body">
              <div className="flex items-start gap-3">
                <span className="text-lg">🦋</span>
                <div className="text-sm">
                  <p className="font-medium text-foreground">Butterfly Effect - Sensitivity to Initial Conditions</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    The red pendulum starts with just 0.001 radian (~0.06°) difference. This demonstrates deterministic chaos - 
                    even tiny, unmeasurable differences explode into completely different outcomes. This is why long-term weather 
                    prediction is fundamentally limited.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {mode === 'coupled' && (
          <div className="mt-4 panel">
            <div className="panel-body">
              <div className="flex items-start gap-3">
                <span className="text-lg">🔗</span>
                <div className="text-sm">
                  <p className="font-medium text-foreground">Coupled Oscillators & Normal Modes</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    When both pendulums start at the same angle, they swing together (in-phase mode). When one starts displaced, 
                    energy transfers between them through the spring. This models molecular vibrations, coupled circuits, and 
                    wave phenomena.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {mode === 'damped' && params.drivingAmplitude > 0 && (
          <div className="mt-4 panel">
            <div className="panel-body">
              <div className="flex items-start gap-3">
                <span className="text-lg">📈</span>
                <div className="text-sm">
                  <p className="font-medium text-foreground">Resonance Phenomenon</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Natural frequency: <span className="data-value">{Math.sqrt(params.gravity / params.length).toFixed(2)} rad/s</span>. 
                    When driving frequency approaches this value, the system absorbs maximum energy (resonance). 
                    This caused the Tacoma Narrows Bridge collapse and is why soldiers break step crossing bridges.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {mode === 'simple' && (
          <div className="mt-4 panel">
            <div className="panel-body">
              <div className="flex items-start gap-3">
                <span className="text-lg">⏰</span>
                <div className="text-sm">
                  <p className="font-medium text-foreground">Simple Harmonic Motion Applications</p>
                  <p className="text-muted-foreground text-xs mt-1">
                    Period T = 2π√(L/g) depends only on length and gravity. This made pendulum clocks revolutionary for 
                    timekeeping, enables gravimeters to measure local gravity variations, and Foucault pendulums to demonstrate 
                    Earth's rotation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
