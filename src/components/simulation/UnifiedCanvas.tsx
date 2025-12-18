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
