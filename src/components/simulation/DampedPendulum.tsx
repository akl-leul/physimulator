import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

interface DampedPendulumProps {
  length: number;
  mass: number;
  angle: number;
  gravity: number;
  damping: number;
  drivingFrequency: number;
  drivingAmplitude: number;
  isPlaying: boolean;
  onStateUpdate: (angle: number, velocity: number) => void;
  showTrail?: boolean;
}

const DampedPendulum = ({
  length,
  mass,
  angle: initialAngle,
  gravity,
  damping,
  drivingFrequency,
  drivingAmplitude,
  isPlaying,
  onStateUpdate,
  showTrail = true,
}: DampedPendulumProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const thetaRef = useRef(initialAngle);
  const omegaRef = useRef(0);
  const timeRef = useRef(0);
  const lastUpdateRef = useRef(0);
  
  const [trail, setTrail] = useState<[number, number, number][]>([]);
  const trailRef = useRef<[number, number, number][]>([]);

  useEffect(() => {
    if (!isPlaying) {
      thetaRef.current = initialAngle;
      omegaRef.current = 0;
      timeRef.current = 0;
      trailRef.current = [];
      setTrail([]);
    }
  }, [isPlaying, initialAngle]);

  useFrame((state, delta) => {
    if (!isPlaying) return;

    const dt = Math.min(delta, 0.02);
    timeRef.current += dt;

    const t = thetaRef.current;
    let w = omegaRef.current;
    const g = gravity;
    const L = length;
    const b = damping;
    const F0 = drivingAmplitude;
    const wd = drivingFrequency;

    // Damped driven pendulum: θ'' = -(g/L)sin(θ) - b*θ' + F0*cos(wd*t)
    const drivingForce = F0 * Math.cos(wd * timeRef.current);
    const angularAccel = -(g / L) * Math.sin(t) - b * w + drivingForce;

    w += angularAccel * dt;
    const newTheta = t + w * dt;

    thetaRef.current = newTheta;
    omegaRef.current = w;

    // Calculate position for trail
    const x = L * Math.sin(newTheta);
    const y = -L * Math.cos(newTheta);

    if (showTrail) {
      trailRef.current.push([x, y, 0]);
      if (trailRef.current.length > 200) {
        trailRef.current = trailRef.current.slice(-200);
      }
      if (state.clock.elapsedTime - lastUpdateRef.current > 0.05) {
        setTrail([...trailRef.current]);
      }
    }

    if (state.clock.elapsedTime - lastUpdateRef.current > 0.016) {
      onStateUpdate(newTheta, w);
      lastUpdateRef.current = state.clock.elapsedTime;
    }
  });

  const theta = thetaRef.current;
  const x = length * Math.sin(theta);
  const y = -length * Math.cos(theta);
  const bobRadius = 0.1 + mass * 0.02;

  // Resonance indicator color
  const naturalFreq = Math.sqrt(gravity / length);
  const isNearResonance = Math.abs(drivingFrequency - naturalFreq) < 0.3;
  const bobColor = isNearResonance ? '#ef4444' : '#0891b2';

  return (
    <group ref={groupRef}>
      {/* Trail */}
      {showTrail && trail.length > 2 && (
        <Line
          points={trail}
          color="#0891b2"
          lineWidth={1}
          transparent
          opacity={0.4}
        />
      )}

      {/* Rod */}
      <Line
        points={[[0, 0, 0], [x, y, 0]]}
        color="#64748b"
        lineWidth={2}
      />

      {/* Pivot with driving indicator */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.06, 32, 32]} />
        <meshStandardMaterial 
          color={drivingAmplitude > 0 ? '#f59e0b' : '#374151'} 
        />
      </mesh>

      {/* Bob */}
      <mesh position={[x, y, 0]}>
        <sphereGeometry args={[bobRadius, 32, 32]} />
        <meshStandardMaterial color={bobColor} metalness={0.3} roughness={0.4} />
      </mesh>

      {/* Resonance glow */}
      {isNearResonance && drivingAmplitude > 0 && (
        <mesh position={[x, y, 0]}>
          <sphereGeometry args={[bobRadius * 1.5, 32, 32]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.15} />
        </mesh>
      )}
    </group>
  );
};

export default DampedPendulum;
