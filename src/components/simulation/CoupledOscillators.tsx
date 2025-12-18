import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

interface CoupledOscillatorsProps {
  length: number;
  mass: number;
  gravity: number;
  springConstant: number;
  angle1: number;
  angle2: number;
  isPlaying: boolean;
  onStateUpdate: (state: {
    angle1: number;
    angle2: number;
    velocity1: number;
    velocity2: number;
  }) => void;
  showTrail?: boolean;
}

const CoupledOscillators = ({
  length,
  mass,
  gravity,
  springConstant,
  angle1: initialAngle1,
  angle2: initialAngle2,
  isPlaying,
  onStateUpdate,
  showTrail = true,
}: CoupledOscillatorsProps) => {
  const theta1Ref = useRef(initialAngle1);
  const theta2Ref = useRef(initialAngle2);
  const omega1Ref = useRef(0);
  const omega2Ref = useRef(0);
  const lastTimeRef = useRef(0);

  const [trail1, setTrail1] = useState<[number, number, number][]>([]);
  const [trail2, setTrail2] = useState<[number, number, number][]>([]);
  const trail1Ref = useRef<[number, number, number][]>([]);
  const trail2Ref = useRef<[number, number, number][]>([]);

  useEffect(() => {
    if (!isPlaying) {
      theta1Ref.current = initialAngle1;
      theta2Ref.current = initialAngle2;
      omega1Ref.current = 0;
      omega2Ref.current = 0;
      trail1Ref.current = [];
      trail2Ref.current = [];
      setTrail1([]);
      setTrail2([]);
    }
  }, [isPlaying, initialAngle1, initialAngle2]);

  useFrame((state, delta) => {
    if (!isPlaying) return;

    const dt = Math.min(delta, 0.02);
    const g = gravity;
    const L = length;
    const m = mass;
    const k = springConstant;

    let t1 = theta1Ref.current;
    let t2 = theta2Ref.current;
    let w1 = omega1Ref.current;
    let w2 = omega2Ref.current;

    // Coupled pendulum equations
    // θ1'' = -(g/L)sin(θ1) - (k/m)(θ1 - θ2)
    // θ2'' = -(g/L)sin(θ2) - (k/m)(θ2 - θ1)
    
    // Coupling term (linear spring approximation)
    const coupling = (k / m) * (t1 - t2);
    
    const alpha1 = -(g / L) * Math.sin(t1) - coupling;
    const alpha2 = -(g / L) * Math.sin(t2) + coupling;

    w1 += alpha1 * dt;
    w2 += alpha2 * dt;
    
    // Small damping
    w1 *= 0.9999;
    w2 *= 0.9999;
    
    t1 += w1 * dt;
    t2 += w2 * dt;

    theta1Ref.current = t1;
    theta2Ref.current = t2;
    omega1Ref.current = w1;
    omega2Ref.current = w2;

    // Calculate positions
    const x1 = -1 + L * Math.sin(t1);
    const y1 = -L * Math.cos(t1);
    const x2 = 1 + L * Math.sin(t2);
    const y2 = -L * Math.cos(t2);

    if (showTrail) {
      trail1Ref.current.push([x1, y1, 0]);
      trail2Ref.current.push([x2, y2, 0]);
      if (trail1Ref.current.length > 150) {
        trail1Ref.current = trail1Ref.current.slice(-150);
        trail2Ref.current = trail2Ref.current.slice(-150);
      }
      if (state.clock.elapsedTime - lastTimeRef.current > 0.05) {
        setTrail1([...trail1Ref.current]);
        setTrail2([...trail2Ref.current]);
      }
    }

    if (state.clock.elapsedTime - lastTimeRef.current > 0.016) {
      onStateUpdate({
        angle1: t1,
        angle2: t2,
        velocity1: w1,
        velocity2: w2,
      });
      lastTimeRef.current = state.clock.elapsedTime;
    }
  });

  const t1 = theta1Ref.current;
  const t2 = theta2Ref.current;
  const x1 = -1 + length * Math.sin(t1);
  const y1 = -length * Math.cos(t1);
  const x2 = 1 + length * Math.sin(t2);
  const y2 = -length * Math.cos(t2);

  const bobRadius = 0.1 + mass * 0.02;

  // Spring between bobs
  const springPoints: [number, number, number][] = [];
  const coils = 10;
  for (let i = 0; i <= coils * 4; i++) {
    const t = i / (coils * 4);
    const sx = x1 + t * (x2 - x1);
    const sy = y1 + t * (y2 - y1) + Math.sin(t * coils * Math.PI * 2) * 0.08;
    springPoints.push([sx, sy, 0]);
  }

  return (
    <group>
      {/* Trails */}
      {showTrail && trail1.length > 2 && (
        <Line points={trail1} color="#0891b2" lineWidth={1} transparent opacity={0.4} />
      )}
      {showTrail && trail2.length > 2 && (
        <Line points={trail2} color="#14b8a6" lineWidth={1} transparent opacity={0.4} />
      )}

      {/* Pivot 1 */}
      <mesh position={[-1, 0, 0]}>
        <sphereGeometry args={[0.05, 32, 32]} />
        <meshStandardMaterial color="#374151" />
      </mesh>

      {/* Pivot 2 */}
      <mesh position={[1, 0, 0]}>
        <sphereGeometry args={[0.05, 32, 32]} />
        <meshStandardMaterial color="#374151" />
      </mesh>

      {/* Support bar */}
      <Line points={[[-1.5, 0, 0], [1.5, 0, 0]]} color="#64748b" lineWidth={3} />

      {/* Rod 1 */}
      <Line points={[[-1, 0, 0], [x1, y1, 0]]} color="#64748b" lineWidth={2} />

      {/* Rod 2 */}
      <Line points={[[1, 0, 0], [x2, y2, 0]]} color="#64748b" lineWidth={2} />

      {/* Coupling spring */}
      <Line points={springPoints} color="#f59e0b" lineWidth={1.5} />

      {/* Bob 1 */}
      <mesh position={[x1, y1, 0]}>
        <sphereGeometry args={[bobRadius, 32, 32]} />
        <meshStandardMaterial color="#0891b2" metalness={0.3} roughness={0.4} />
      </mesh>

      {/* Bob 2 */}
      <mesh position={[x2, y2, 0]}>
        <sphereGeometry args={[bobRadius, 32, 32]} />
        <meshStandardMaterial color="#14b8a6" metalness={0.3} roughness={0.4} />
      </mesh>
    </group>
  );
};

export default CoupledOscillators;
