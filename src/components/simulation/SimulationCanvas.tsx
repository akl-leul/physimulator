import { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Environment, PerspectiveCamera } from '@react-three/drei';
import Pendulum from './Pendulum';

interface SimulationCanvasProps {
  length: number;
  mass: number;
  angle: number;
  gravity: number;
  isPlaying: boolean;
  onAngleUpdate: (angle: number, velocity: number) => void;
  angularVelocityRef: React.MutableRefObject<number>;
}

const SimulationCanvas = ({
  length,
  mass,
  angle,
  gravity,
  isPlaying,
  onAngleUpdate,
  angularVelocityRef,
}: SimulationCanvasProps) => {
  return (
    <div className="simulation-canvas w-full h-full bg-background">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
        
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={0.8}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <pointLight position={[-5, 5, -5]} intensity={0.4} color="#22d3ee" />
        <pointLight position={[0, -3, 2]} intensity={0.2} color="#14b8a6" />

        {/* Environment for reflections */}
        <Environment preset="night" />

        {/* Grid floor */}
        <Grid
          position={[0, -length - 0.5, 0]}
          args={[10, 10]}
          cellSize={0.5}
          cellThickness={0.5}
          cellColor="#1e293b"
          sectionSize={2}
          sectionThickness={1}
          sectionColor="#334155"
          fadeDistance={15}
          fadeStrength={1}
          followCamera={false}
        />

        {/* Pendulum */}
        <Pendulum
          length={length}
          mass={mass}
          angle={angle}
          gravity={gravity}
          isPlaying={isPlaying}
          onAngleUpdate={onAngleUpdate}
          angularVelocityRef={angularVelocityRef}
        />

        {/* Pivot mount visualization */}
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[0.4, 0.1, 0.2]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Support structure */}
        <mesh position={[0, 0.5, -0.1]}>
          <boxGeometry args={[0.1, 0.8, 0.05]} />
          <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.4} />
        </mesh>

        {/* Camera controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={15}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
    </div>
  );
};

export default SimulationCanvas;
