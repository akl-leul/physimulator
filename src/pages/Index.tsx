import { useState, useRef, useCallback, useEffect } from 'react';
import SimulationCanvas from '@/components/simulation/SimulationCanvas';
import ControlPanel from '@/components/simulation/ControlPanel';
import DataDisplay from '@/components/simulation/DataDisplay';
import GraphPanel from '@/components/simulation/GraphPanel';

const Index = () => {
  // Simulation parameters
  const [length, setLength] = useState(2);
  const [mass, setMass] = useState(1);
  const [initialAngle, setInitialAngle] = useState(Math.PI / 4); // 45 degrees
  const [gravity, setGravity] = useState(9.81);
  
  // Simulation state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAngle, setCurrentAngle] = useState(Math.PI / 4);
  const [currentVelocity, setCurrentVelocity] = useState(0);
  const angularVelocityRef = useRef(0);
  
  // Data history for graphs
  const [dataHistory, setDataHistory] = useState<Array<{
    time: number;
    angle: number;
    velocity: number;
    ke: number;
    pe: number;
  }>>([]);
  const timeRef = useRef(0);
  const lastUpdateRef = useRef(0);

  // Handle angle updates from physics simulation
  const handleAngleUpdate = useCallback((angle: number, velocity: number) => {
    setCurrentAngle(angle);
    setCurrentVelocity(velocity);
    
    // Update time
    const now = performance.now();
    const dt = (now - lastUpdateRef.current) / 1000;
    lastUpdateRef.current = now;
    timeRef.current += dt;

    // Calculate energies
    const height = length * (1 - Math.cos(angle));
    const pe = mass * gravity * height;
    const ke = 0.5 * mass * Math.pow(length * velocity, 2);

    // Add to history
    setDataHistory(prev => {
      const newEntry = {
        time: timeRef.current,
        angle,
        velocity,
        ke,
        pe,
      };
      // Keep last 500 entries
      const updated = [...prev, newEntry];
      if (updated.length > 500) {
        return updated.slice(-500);
      }
      return updated;
    });
  }, [length, mass, gravity]);

  // Play/Pause handler
  const handlePlayPause = () => {
    if (!isPlaying) {
      lastUpdateRef.current = performance.now();
    }
    setIsPlaying(!isPlaying);
  };

  // Reset handler
  const handleReset = () => {
    setIsPlaying(false);
    setCurrentAngle(initialAngle);
    setCurrentVelocity(0);
    angularVelocityRef.current = 0;
    timeRef.current = 0;
    setDataHistory([]);
  };

  // Sync angle when initial angle changes
  useEffect(() => {
    if (!isPlaying) {
      setCurrentAngle(initialAngle);
      angularVelocityRef.current = 0;
    }
  }, [initialAngle, isPlaying]);

  return (
    <div className="min-h-screen bg-background bg-grid-pattern">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gradient-primary">
                Physics Simulation Lab
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Interactive Simple Harmonic Motion Explorer
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="parameter-label">Simple Pendulum</span>
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Controls */}
          <aside className="lg:col-span-3 space-y-6">
            <ControlPanel
              length={length}
              mass={mass}
              angle={initialAngle}
              gravity={gravity}
              isPlaying={isPlaying}
              onLengthChange={setLength}
              onMassChange={setMass}
              onAngleChange={setInitialAngle}
              onGravityChange={setGravity}
              onPlayPause={handlePlayPause}
              onReset={handleReset}
            />
          </aside>

          {/* Center - 3D Simulation */}
          <section className="lg:col-span-6">
            <div className="glass-panel overflow-hidden" style={{ height: '500px' }}>
              <SimulationCanvas
                length={length}
                mass={mass}
                angle={currentAngle}
                gravity={gravity}
                isPlaying={isPlaying}
                onAngleUpdate={handleAngleUpdate}
                angularVelocityRef={angularVelocityRef}
              />
            </div>
            
            {/* Equation Display */}
            <div className="glass-panel mt-4 p-4">
              <div className="flex items-center justify-center gap-8 text-sm">
                <div className="text-center">
                  <p className="parameter-label mb-1">Equation of Motion</p>
                  <p className="font-mono text-primary">θ̈ = -(g/L)sin(θ)</p>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="text-center">
                  <p className="parameter-label mb-1">Period (Small Angle)</p>
                  <p className="font-mono text-primary">T = 2π√(L/g)</p>
                </div>
              </div>
            </div>
          </section>

          {/* Right Sidebar - Data & Graphs */}
          <aside className="lg:col-span-3 space-y-6">
            <DataDisplay
              angle={currentAngle}
              angularVelocity={currentVelocity}
              length={length}
              mass={mass}
              gravity={gravity}
              isPlaying={isPlaying}
            />
            <GraphPanel dataHistory={dataHistory} />
          </aside>
        </div>

        {/* Educational Footer */}
        <footer className="mt-8 glass-panel p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <h3 className="font-semibold text-primary mb-2">Simple Harmonic Motion</h3>
              <p className="text-muted-foreground">
                A pendulum exhibits SHM when displaced by small angles. The restoring force is proportional to displacement, creating oscillatory motion.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-primary mb-2">Energy Conservation</h3>
              <p className="text-muted-foreground">
                Total mechanical energy remains constant (ignoring damping). Watch how kinetic and potential energy transform throughout the cycle.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-primary mb-2">Key Insight</h3>
              <p className="text-muted-foreground">
                The period depends only on length and gravity—not on mass or amplitude (for small angles). This is why pendulums make excellent timekeepers.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
