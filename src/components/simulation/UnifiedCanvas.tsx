import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, PerspectiveCamera } from '@react-three/drei';
import SimplePendulum from './SimplePendulum';
import DoublePendulum from './DoublePendulum';
import DampedPendulum from './DampedPendulum';
import MassSpring from './MassSpring';
import CoupledOscillators from './CoupledOscillators';
import { SimulationMode } from '@/types/simulation';

interface UnifiedCanvasProps {
  mode: SimulationMode;
  params: {
    length: number;
    length2: number;
    mass: number;
    mass2: number;
    gravity: number;
    angle: number;
    angle2: number;
    damping: number;
    drivingFrequency: number;
    drivingAmplitude: number;
    springConstant: number;
    displacement: number;
  };
  isPlaying: boolean;
  showTrail: boolean;
  onSimpleUpdate: (angle: number, velocity: number) => void;
  onDoubleUpdate: (state: { angle1: number; angle2: number; velocity1: number; velocity2: number }) => void;
  onDouble2Update: (state: { angle1: number; angle2: number; velocity1: number; velocity2: number }) => void;
  onDampedUpdate: (angle: number, velocity: number) => void;
  onSpringUpdate: (displacement: number, velocity: number) => void;
  onCoupledUpdate: (state: { angle1: number; angle2: number; velocity1: number; velocity2: number }) => void;
  angularVelocityRef: React.MutableRefObject<number>;
  showChaosComparison?: boolean;
}

const UnifiedCanvas = ({
  mode,
  params,
  isPlaying,
  showTrail,
  onSimpleUpdate,
  onDoubleUpdate,
  onDouble2Update,
  onDampedUpdate,
  onSpringUpdate,
  onCoupledUpdate,
  angularVelocityRef,
  showChaosComparison = true,
}: UnifiedCanvasProps) => {
  const getCameraPosition = (): [number, number, number] => {
    if (mode === 'spring') return [0, 0, 5];
    if (mode === 'coupled') return [0, 0, 7];
    return [0, 0, 6];
  };

  const getGridY = () => {
    if (mode === 'spring') return -0.5;
    if (mode === 'coupled') return -params.length - 0.3;
    if (mode === 'double') return -params.length - params.length2 - 0.3;
    return -params.length - 0.3;
  };

  // Pivot Mount component - shows where pendulum attaches
  const PivotMount = ({ position = [0, 0, 0] as [number, number, number] }) => {
    const mountHeight = 0.8;
    const mountWidth = 0.3;
    const pivotRadius = 0.12;

    return (
      <group position={position}>
        {/* Support post/beam */}
        <mesh position={[0, mountHeight / 2, 0]}>
          <boxGeometry args={[mountWidth, mountHeight, mountWidth * 0.6]} />
          <meshStandardMaterial 
            color="#475569" 
            metalness={0.7}
            roughness={0.3}
          />
        </mesh>

        {/* Pivot mount base */}
        <mesh position={[0, mountHeight, 0]}>
          <boxGeometry args={[mountWidth * 1.5, mountWidth * 0.3, mountWidth * 1.2]} />
          <meshStandardMaterial 
            color="#334155" 
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Pivot point (where pendulum attaches) */}
        <mesh position={[0, mountHeight + mountWidth * 0.15, 0]}>
          <sphereGeometry args={[pivotRadius, 32, 32]} />
          <meshStandardMaterial 
            color="#0891b2" 
            emissive="#0891b2"
            emissiveIntensity={0.4}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* Pivot ring/holder */}
        <mesh position={[0, mountHeight + mountWidth * 0.15, 0]}>
          <torusGeometry args={[pivotRadius * 1.3, 0.02, 16, 32]} />
          <meshStandardMaterial 
            color="#64748b" 
            metalness={0.8}
            roughness={0.3}
          />
        </mesh>
      </group>
    );
  };

  // Walls component
  const Walls = () => {
    const wallSize = 12;
    const wallHeight = 10;
    const gridY = getGridY();
    const floorY = gridY - 0.1;
    const wallThickness = 0.1;

    return (
      <>
        {/* Back wall */}
        <mesh position={[0, wallHeight / 2 + floorY, -wallSize / 2]} rotation={[0, 0, 0]}>
          <boxGeometry args={[wallSize, wallHeight, wallThickness]} />
          <meshStandardMaterial 
            color="#e2e8f0" 
            opacity={0.3} 
            transparent 
            metalness={0.1}
            roughness={0.8}
          />
        </mesh>

        {/* Front wall (semi-transparent) */}
        <mesh position={[0, wallHeight / 2 + floorY, wallSize / 2]} rotation={[0, 0, 0]}>
          <boxGeometry args={[wallSize, wallHeight, wallThickness]} />
          <meshStandardMaterial 
            color="#e2e8f0" 
            opacity={0.2} 
            transparent 
            metalness={0.1}
            roughness={0.8}
          />
        </mesh>

        {/* Left wall */}
        <mesh position={[-wallSize / 2, wallHeight / 2 + floorY, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[wallSize, wallHeight, wallThickness]} />
          <meshStandardMaterial 
            color="#e2e8f0" 
            opacity={0.3} 
            transparent 
            metalness={0.1}
            roughness={0.8}
          />
        </mesh>

        {/* Right wall */}
        <mesh position={[wallSize / 2, wallHeight / 2 + floorY, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[wallSize, wallHeight, wallThickness]} />
          <meshStandardMaterial 
            color="#e2e8f0" 
            opacity={0.3} 
            transparent 
            metalness={0.1}
            roughness={0.8}
          />
        </mesh>

        {/* Ceiling */}
        <mesh position={[0, wallHeight + floorY, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <boxGeometry args={[wallSize, wallSize, wallThickness]} />
          <meshStandardMaterial 
            color="#cbd5e1" 
            opacity={0.2} 
            transparent 
            metalness={0.1}
            roughness={0.8}
          />
        </mesh>
      </>
    );
  };

  return (
    <div className="simulation-view w-full h-full">
      <Canvas>
        <PerspectiveCamera makeDefault position={getCameraPosition()} fov={50} />
        
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <pointLight position={[-3, 3, 3]} intensity={0.3} color="#0891b2" />

        <Grid
          position={[0, getGridY(), 0]}
          args={[10, 10]}
          cellSize={0.5}
          cellThickness={0.5}
          cellColor="#e2e8f0"
          sectionSize={2}
          sectionThickness={1}
          sectionColor="#cbd5e1"
          fadeDistance={15}
          fadeStrength={1}
          followCamera={false}
        />

        {/* Walls */}
        <Walls />

        {/* Pivot Mounts */}
        {mode === 'simple' && <PivotMount position={[0, 0, 0]} />}
        {mode === 'double' && <PivotMount position={[0, 0, 0]} />}
        {mode === 'damped' && <PivotMount position={[0, 0, 0]} />}
        {mode === 'coupled' && (
          <>
            <PivotMount position={[-1, 0, 0]} />
            <PivotMount position={[1, 0, 0]} />
          </>
        )}

        {mode === 'simple' && (
          <SimplePendulum
            length={params.length}
            mass={params.mass}
            angle={params.angle}
            gravity={params.gravity}
            isPlaying={isPlaying}
            onStateUpdate={onSimpleUpdate}
            angularVelocityRef={angularVelocityRef}
            showTrail={showTrail}
          />
        )}

        {mode === 'double' && (
          <>
            <DoublePendulum
              length1={params.length}
              length2={params.length2}
              mass1={params.mass}
              mass2={params.mass2}
              angle1={params.angle}
              angle2={params.angle2}
              gravity={params.gravity}
              isPlaying={isPlaying}
              onStateUpdate={onDoubleUpdate}
              showTrail={showTrail}
              trailColor="#0891b2"
              perturbation={0}
            />
            {showChaosComparison && (
              <DoublePendulum
                length1={params.length}
                length2={params.length2}
                mass1={params.mass}
                mass2={params.mass2}
                angle1={params.angle}
                angle2={params.angle2}
                gravity={params.gravity}
                isPlaying={isPlaying}
                onStateUpdate={onDouble2Update}
                showTrail={showTrail}
                trailColor="#f43f5e"
                perturbation={0.001}
              />
            )}
          </>
        )}

        {mode === 'damped' && (
          <DampedPendulum
            length={params.length}
            mass={params.mass}
            angle={params.angle}
            gravity={params.gravity}
            damping={params.damping}
            drivingFrequency={params.drivingFrequency}
            drivingAmplitude={params.drivingAmplitude}
            isPlaying={isPlaying}
            onStateUpdate={onDampedUpdate}
            showTrail={showTrail}
          />
        )}

        {mode === 'spring' && (
          <MassSpring
            mass={params.mass}
            springConstant={params.springConstant}
            damping={params.damping}
            drivingFrequency={params.drivingFrequency}
            drivingAmplitude={params.drivingAmplitude}
            initialDisplacement={params.displacement}
            isPlaying={isPlaying}
            onStateUpdate={onSpringUpdate}
            showTrail={showTrail}
          />
        )}

        {mode === 'coupled' && (
          <CoupledOscillators
            length={params.length}
            mass={params.mass}
            gravity={params.gravity}
            springConstant={params.springConstant}
            angle1={params.angle}
            angle2={params.angle2}
            isPlaying={isPlaying}
            onStateUpdate={onCoupledUpdate}
            showTrail={showTrail}
          />
        )}

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={15}
        />
      </Canvas>
    </div>
  );
};

export default UnifiedCanvas;
