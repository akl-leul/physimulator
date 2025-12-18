import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

interface PendulumProps {
  length: number;
  mass: number;
  angle: number;
  isPlaying: boolean;
  onAngleUpdate: (angle: number, velocity: number) => void;
  angularVelocityRef: React.MutableRefObject<number>;
  gravity: number;
}

const Pendulum = ({ 
  length, 
  mass, 
  angle, 
  isPlaying, 
  onAngleUpdate,
  angularVelocityRef,
  gravity 
}: PendulumProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const currentAngleRef = useRef(angle);
  const lastTimeRef = useRef(0);

  // Sync with external angle when not playing
  if (!isPlaying) {
    currentAngleRef.current = angle;
  }

  // Calculate bob position
  const bobPosition = useMemo(() => {
    const x = Math.sin(angle) * length;
    const y = -Math.cos(angle) * length;
    return new THREE.Vector3(x, y, 0);
  }, [angle, length]);

  // Physics simulation
  useFrame((state, delta) => {
    if (!isPlaying || !groupRef.current) return;

    // Clamp delta to prevent instability
    const dt = Math.min(delta, 0.05);

    // Simple pendulum equation: θ'' = -(g/L) * sin(θ)
    const angularAcceleration = -(gravity / length) * Math.sin(currentAngleRef.current);
    
    // Semi-implicit Euler integration
    angularVelocityRef.current += angularAcceleration * dt;
    
    // Add slight damping for realism
    angularVelocityRef.current *= 0.9995;
    
    currentAngleRef.current += angularVelocityRef.current * dt;

    // Update group rotation for visual effect
    groupRef.current.rotation.z = currentAngleRef.current;

    // Report back to parent (throttled)
    if (state.clock.elapsedTime - lastTimeRef.current > 0.016) {
      onAngleUpdate(currentAngleRef.current, angularVelocityRef.current);
      lastTimeRef.current = state.clock.elapsedTime;
    }
  });

  // Scale mass for visualization (clamped)
  const bobRadius = 0.15 + Math.min(mass, 10) * 0.03;

  // Line points for the rod
  const linePoints: [number, number, number][] = useMemo(() => [
    [0, 0, 0],
    [0, -length, 0]
  ], [length]);

  return (
    <group ref={groupRef} rotation={[0, 0, isPlaying ? undefined : angle]}>
      {/* Pivot point */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.08, 32, 32]} />
        <meshStandardMaterial 
          color="#22d3ee" 
          emissive="#22d3ee"
          emissiveIntensity={0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Rod using drei Line */}
      <Line
        points={linePoints}
        color="#64748b"
        lineWidth={3}
      />

      {/* Rod cylinder for better visibility */}
      <mesh position={[0, -length / 2, 0]}>
        <cylinderGeometry args={[0.02, 0.02, length, 16]} />
        <meshStandardMaterial 
          color="#475569" 
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>

      {/* Bob (mass) */}
      <mesh position={[0, -length, 0]}>
        <sphereGeometry args={[bobRadius, 64, 64]} />
        <meshStandardMaterial 
          color="#22d3ee"
          emissive="#22d3ee"
          emissiveIntensity={0.2}
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Glow effect around bob */}
      <mesh position={[0, -length, 0]}>
        <sphereGeometry args={[bobRadius * 1.5, 32, 32]} />
        <meshBasicMaterial 
          color="#22d3ee"
          transparent
          opacity={0.1}
        />
      </mesh>
    </group>
  );
};

export default Pendulum;
