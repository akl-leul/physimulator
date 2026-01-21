import { useState, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Grid } from '@react-three/drei';
import SimplePendulum from './SimplePendulum';
import DampedPendulum from './DampedPendulum';
import MassSpring from './MassSpring';
import DoublePendulum from './DoublePendulum';
import { SimulationMode } from '@/types/simulation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

const COMPARISON_MODES: SimulationMode[] = ['simple', 'damped', 'spring', 'double'];

interface ComparisonConfig {
  mode: SimulationMode;
  length: number;
  mass: number;
  gravity: number;
  angle: number;
  damping: number;
  drivingFrequency: number;
  drivingAmplitude: number;
  springConstant: number;
}

const defaultConfig: ComparisonConfig = {
  mode: 'simple',
  length: 1.5,
  mass: 1,
  gravity: 9.81,
  angle: Math.PI / 4,
  damping: 0.1,
  drivingFrequency: 2.0,
  drivingAmplitude: 0,
  springConstant: 20,
};

interface SimulationPanelProps {
  config: ComparisonConfig;
  isPlaying: boolean;
  showTrail: boolean;
  label: string;
}

const SimulationPanel = ({ config, isPlaying, showTrail, label }: SimulationPanelProps) => {
  const velocityRef = useRef(0);

  return (
    <div className="flex-1 border border-border rounded-lg overflow-hidden bg-card">
      <div className="px-3 py-2 border-b border-border bg-secondary/30">
        <span className="text-xs font-medium text-foreground">{label}</span>
        <span className="text-xs text-muted-foreground ml-2">
          ({config.mode === 'simple' ? 'Simple' : config.mode === 'damped' ? 'Damped' : config.mode === 'spring' ? 'Spring' : 'Double'})
        </span>
      </div>
      <div className="h-[280px]">
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <Environment preset="studio" />
          <Grid
            args={[10, 10]}
            position={[0, -2.5, 0]}
            cellSize={0.5}
            cellColor="hsl(220, 20%, 85%)"
            sectionColor="hsl(220, 20%, 75%)"
            fadeDistance={15}
          />

          {config.mode === 'simple' && (
            <SimplePendulum
              length={config.length}
              mass={config.mass}
              gravity={config.gravity}
              angle={config.angle}
              isPlaying={isPlaying}
              showTrail={showTrail}
              onStateUpdate={() => { }}
              angularVelocityRef={velocityRef}
            />
          )}

          {config.mode === 'damped' && (
            <DampedPendulum
              length={config.length}
              mass={config.mass}
              gravity={config.gravity}
              angle={config.angle}
              damping={config.damping}
              drivingFrequency={config.drivingFrequency}
              drivingAmplitude={config.drivingAmplitude}
              isPlaying={isPlaying}
              showTrail={showTrail}
              onStateUpdate={() => { }}
            />
          )}

          {config.mode === 'spring' && (
            <MassSpring
              springConstant={config.springConstant}
              mass={config.mass}
              damping={config.damping}
              drivingFrequency={config.drivingFrequency}
              drivingAmplitude={config.drivingAmplitude}
              initialDisplacement={0.5}
              isPlaying={isPlaying}
              showTrail={showTrail}
              onStateUpdate={() => { }}
            />
          )}

          {config.mode === 'double' && (
            <DoublePendulum
              length1={config.length}
              length2={config.length * 0.7}
              mass1={config.mass}
              mass2={config.mass}
              gravity={config.gravity}
              angle1={config.angle}
              angle2={config.angle * 0.8}
              isPlaying={isPlaying}
              showTrail={showTrail}
              onStateUpdate={() => { }}
            />
          )}

          <OrbitControls
            enablePan={false}
            enableZoom={true}
            minDistance={3}
            maxDistance={10}
          />
        </Canvas>
      </div>
    </div>
  );
};

interface ComparisonViewProps {
  onClose: () => void;
}

const ComparisonView = ({ onClose }: ComparisonViewProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTrail, setShowTrail] = useState(true);
  const [resetKey, setResetKey] = useState(0);

  const [leftConfig, setLeftConfig] = useState<ComparisonConfig>({ ...defaultConfig });
  const [rightConfig, setRightConfig] = useState<ComparisonConfig>({
    ...defaultConfig,
    mode: 'damped',
    damping: 0.2
  });

  const handleReset = () => {
    setIsPlaying(false);
    setResetKey(prev => prev + 1);
  };

  const updateLeftConfig = (key: keyof ComparisonConfig, value: number | SimulationMode) => {
    setLeftConfig(prev => ({ ...prev, [key]: value }));
  };

  const updateRightConfig = (key: keyof ComparisonConfig, value: number | SimulationMode) => {
    setRightConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      <div className="h-full flex flex-col">
        {/* Header */}
        <header className="border-b border-border bg-card px-4 py-3 sticky top-0 z-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-center sm:text-left">
              <h2 className="text-lg font-semibold text-foreground">Comparison Mode</h2>
              <p className="text-xs text-muted-foreground sm:block hidden">Run two simulations side by side to compare behaviors</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <Button
                onClick={() => setIsPlaying(!isPlaying)}
                className="btn btn-primary h-8 sm:h-9"
                size="sm"
              >
                {isPlaying ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                {isPlaying ? 'Pause' : 'Start'}
              </Button>
              <Button onClick={handleReset} variant="outline" size="sm" className="h-8 sm:h-9">
                <RotateCcw className="w-4 h-4 mr-1" />
                Reset
              </Button>
              <Button onClick={onClose} variant="outline" size="sm" className="h-8 sm:h-9">
                Exit
              </Button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <div className="flex-1 p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" key={resetKey}>
            {/* Left simulation */}
            <div className="space-y-3">
              <SimulationPanel
                config={leftConfig}
                isPlaying={isPlaying}
                showTrail={showTrail}
                label="Simulation A"
              />

              <div className="panel">
                <div className="panel-body space-y-3">
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-medium w-16">Type:</label>
                    <Select
                      value={leftConfig.mode}
                      onValueChange={(v) => updateLeftConfig('mode', v as SimulationMode)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COMPARISON_MODES.map(m => (
                          <SelectItem key={m} value={m} className="text-xs">
                            {m === 'simple' ? 'Simple Pendulum' :
                              m === 'damped' ? 'Damped/Driven' :
                                m === 'spring' ? 'Mass-Spring' : 'Double Pendulum'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>Length: {leftConfig.length.toFixed(2)} m</span>
                    </div>
                    <Slider
                      value={[leftConfig.length]}
                      onValueChange={([v]) => updateLeftConfig('length', v)}
                      min={0.5}
                      max={3}
                      step={0.1}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>Initial Angle: {(leftConfig.angle * 180 / Math.PI).toFixed(0)}°</span>
                    </div>
                    <Slider
                      value={[leftConfig.angle]}
                      onValueChange={([v]) => updateLeftConfig('angle', v)}
                      min={0.1}
                      max={Math.PI}
                      step={0.05}
                    />
                  </div>

                  {leftConfig.mode === 'damped' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span>Damping: {leftConfig.damping.toFixed(2)}</span>
                      </div>
                      <Slider
                        value={[leftConfig.damping]}
                        onValueChange={([v]) => updateLeftConfig('damping', v)}
                        min={0}
                        max={1}
                        step={0.05}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right simulation */}
            <div className="space-y-3">
              <SimulationPanel
                config={rightConfig}
                isPlaying={isPlaying}
                showTrail={showTrail}
                label="Simulation B"
              />

              <div className="panel">
                <div className="panel-body space-y-3">
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-medium w-16">Type:</label>
                    <Select
                      value={rightConfig.mode}
                      onValueChange={(v) => updateRightConfig('mode', v as SimulationMode)}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COMPARISON_MODES.map(m => (
                          <SelectItem key={m} value={m} className="text-xs">
                            {m === 'simple' ? 'Simple Pendulum' :
                              m === 'damped' ? 'Damped/Driven' :
                                m === 'spring' ? 'Mass-Spring' : 'Double Pendulum'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>Length: {rightConfig.length.toFixed(2)} m</span>
                    </div>
                    <Slider
                      value={[rightConfig.length]}
                      onValueChange={([v]) => updateRightConfig('length', v)}
                      min={0.5}
                      max={3}
                      step={0.1}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>Initial Angle: {(rightConfig.angle * 180 / Math.PI).toFixed(0)}°</span>
                    </div>
                    <Slider
                      value={[rightConfig.angle]}
                      onValueChange={([v]) => updateRightConfig('angle', v)}
                      min={0.1}
                      max={Math.PI}
                      step={0.05}
                    />
                  </div>

                  {rightConfig.mode === 'damped' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span>Damping: {rightConfig.damping.toFixed(2)}</span>
                      </div>
                      <Slider
                        value={[rightConfig.damping]}
                        onValueChange={([v]) => updateRightConfig('damping', v)}
                        min={0}
                        max={1}
                        step={0.05}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Comparison insights */}
          <div className="mt-4 panel">
            <div className="panel-body">
              <h3 className="font-semibold text-sm mb-2">Comparison Insights</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-muted-foreground">
                <div>
                  <p className="font-medium text-foreground">Length Effect</p>
                  <p>{"Longer pendulums have longer periods ($T \propto \\sqrt{L}$). Compare different lengths to see this relationship."}</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Damping Effect</p>
                  <p>Damping reduces amplitude over time. Compare with/without damping to see energy dissipation.</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">System Types</p>
                  <p>Compare pendulum vs spring to see how different restoring forces create similar oscillatory motion.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonView;
