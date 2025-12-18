import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { TrailPoint } from '@/types/simulation';

interface DoublePendulumProps {
  length1: number;
  length2: number;
  mass1: number;
  mass2: number;
  angle1: number;
  angle2: number;
  gravity: number;
  isPlaying: boolean;
  onStateUpdate: (state: {
    angle1: number;
    angle2: number;
    velocity1: number;
    velocity2: number;
  }) => void;
  showTrail?: boolean;
  trailColor?: string;
  perturbation?: number;
}

const DoublePendulum = ({
  length1,
  length2,
  mass1,
  mass2,
  angle1: initialAngle1,
  angle2: initialAngle2,
  gravity,
  isPlaying,
  onStateUpdate,
  showTrail = true,
  trailColor = '#0891b2',
  perturbation = 0,
}: DoublePendulumProps) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // State refs for physics
  const theta1Ref = useRef(initialAngle1 + perturbation);
  const theta2Ref = useRef(initialAngle2);
  const omega1Ref = useRef(0);
  const omega2Ref = useRef(0);
  const lastTimeRef = useRef(0);
  
  // Trail state
  const [trail, setTrail] = useState<[number, number, number][]>([]);
  const trailRef = useRef<[number, number, number][]>([]);

  // Reset when not playing
  useEffect(() => {
    if (!isPlaying) {
      theta1Ref.current = initialAngle1 + perturbation;
      theta2Ref.current = initialAngle2;
      omega1Ref.current = 0;
      omega2Ref.current = 0;
      trailRef.current = [];
      setTrail([]);
    }
  }, [isPlaying, initialAngle1, initialAngle2, perturbation]);

  useFrame((state, delta) => {
    if (!isPlaying) return;

    const dt = Math.min(delta, 0.02);
    const g = gravity;
    const L1 = length1;
    const L2 = length2;
    const m1 = mass1;
    const m2 = mass2;

    let t1 = theta1Ref.current;
    let t2 = theta2Ref.current;
    let w1 = omega1Ref.current;
    let w2 = omega2Ref.current;

    // Double pendulum equations of motion
    const delta_t = t1 - t2;
    const den1 = (m1 + m2) * L1 - m2 * L1 * Math.cos(delta_t) * Math.cos(delta_t);
    const den2 = (L2 / L1) * den1;

    const alpha1 = (
      m2 * L1 * w1 * w1 * Math.sin(delta_t) * Math.cos(delta_t) +
      m2 * g * Math.sin(t2) * Math.cos(delta_t) +
      m2 * L2 * w2 * w2 * Math.sin(delta_t) -
      (m1 + m2) * g * Math.sin(t1)
    ) / den1;

    const alpha2 = (
      -m2 * L2 * w2 * w2 * Math.sin(delta_t) * Math.cos(delta_t) +
      (m1 + m2) * (g * Math.sin(t1) * Math.cos(delta_t) - L1 * w1 * w1 * Math.sin(delta_t) - g * Math.sin(t2))
    ) / den2;

    // Semi-implicit Euler
    w1 += alpha1 * dt;
    w2 += alpha2 * dt;
    
    // Tiny damping for stability
    w1 *= 0.9999;
    w2 *= 0.9999;
    
    t1 += w1 * dt;
    t2 += w2 * dt;

    theta1Ref.current = t1;
    theta2Ref.current = t2;
    omega1Ref.current = w1;
    omega2Ref.current = w2;

    // Calculate bob2 position for trail
    const x1 = L1 * Math.sin(t1);
    const y1 = -L1 * Math.cos(t1);
    const x2 = x1 + L2 * Math.sin(t2);
    const y2 = y1 - L2 * Math.cos(t2);

    // Update trail
    if (showTrail) {
      trailRef.current.push([x2, y2, 0]);
      if (trailRef.current.length > 300) {
        trailRef.current = trailRef.current.slice(-300);
      }
      // Update state every few frames for performance
      if (state.clock.elapsedTime - lastTimeRef.current > 0.05) {
        setTrail([...trailRef.current]);
      }
    }

    // Report state
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

  // Calculate positions
  const x1 = length1 * Math.sin(theta1Ref.current);
  const y1 = -length1 * Math.cos(theta1Ref.current);
  const x2 = x1 + length2 * Math.sin(theta2Ref.current);
  const y2 = y1 - length2 * Math.cos(theta2Ref.current);

  const bob1Radius = 0.08 + mass1 * 0.02;
  const bob2Radius = 0.08 + mass2 * 0.02;

  return (
    <group ref={groupRef}>
      {/* Trail */}
      {showTrail && trail.length > 2 && (
        <Line
          points={trail}
          color={trailColor}
          lineWidth={1.5}
          transparent
          opacity={0.6}
        />
      )}

      {/* Rod 1 */}
      <Line
        points={[[0, 0, 0], [x1, y1, 0]]}
        color="#64748b"
        lineWidth={2}
      />

      {/* Rod 2 */}
      <Line
        points={[[x1, y1, 0], [x2, y2, 0]]}
        color="#64748b"
        lineWidth={2}
      />

      {/* Pivot */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.05, 32, 32]} />
        <meshStandardMaterial color="#374151" />
      </mesh>

      {/* Bob 1 */}
      <mesh position={[x1, y1, 0]}>
        <sphereGeometry args={[bob1Radius, 32, 32]} />
        <meshStandardMaterial color={trailColor} metalness={0.3} roughness={0.4} />
      </mesh>

      {/* Bob 2 */}
      <mesh position={[x2, y2, 0]}>
        <sphereGeometry args={[bob2Radius, 32, 32]} />
        <meshStandardMaterial color={trailColor} metalness={0.3} roughness={0.4} />
      </mesh>
    </group>
  );
};

export default DoublePendulum;
