import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

interface SimplePendulumProps {
  length: number;
  mass: number;
  angle: number;
  gravity: number;
  isPlaying: boolean;
  onStateUpdate: (angle: number, velocity: number) => void;
  angularVelocityRef: React.MutableRefObject<number>;
  showTrail?: boolean;
}

const SimplePendulum = ({
  length,
  mass,
  angle,
  gravity,
  isPlaying,
  onStateUpdate,
  angularVelocityRef,
  showTrail = true,
}: SimplePendulumProps) => {
  const currentAngleRef = useRef(angle);
  const lastTimeRef = useRef(0);
  
  const [trail, setTrail] = useState<[number, number, number][]>([]);
  const trailRef = useRef<[number, number, number][]>([]);

  useEffect(() => {
    if (!isPlaying) {
      currentAngleRef.current = angle;
      angularVelocityRef.current = 0;
      trailRef.current = [];
      setTrail([]);
    }
  }, [isPlaying, angle, angularVelocityRef]);

  useFrame((state, delta) => {
    if (!isPlaying) return;

    const dt = Math.min(delta, 0.05);
    const angularAcceleration = -(gravity / length) * Math.sin(currentAngleRef.current);
    
    angularVelocityRef.current += angularAcceleration * dt;
    angularVelocityRef.current *= 0.9995;
    currentAngleRef.current += angularVelocityRef.current * dt;

    // Trail
    const x = Math.sin(currentAngleRef.current) * length;
    const y = -Math.cos(currentAngleRef.current) * length;

    if (showTrail) {
      trailRef.current.push([x, y, 0]);
      if (trailRef.current.length > 150) {
        trailRef.current = trailRef.current.slice(-150);
      }
      if (state.clock.elapsedTime - lastTimeRef.current > 0.03) {
        setTrail([...trailRef.current]);
      }
    }

    if (state.clock.elapsedTime - lastTimeRef.current > 0.016) {
      onStateUpdate(currentAngleRef.current, angularVelocityRef.current);
      lastTimeRef.current = state.clock.elapsedTime;
    }
  });

  const theta = isPlaying ? currentAngleRef.current : angle;
  const x = length * Math.sin(theta);
  const y = -length * Math.cos(theta);
  const bobRadius = 0.12 + Math.min(mass, 10) * 0.02;

  return (
    <group>
      {/* Trail */}
      {showTrail && trail.length > 2 && (
        <Line
          points={trail}
          color="#0891b2"
          lineWidth={1.5}
          transparent
          opacity={0.5}
        />
      )}

      {/* Pivot */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.06, 32, 32]} />
        <meshStandardMaterial color="#374151" />
      </mesh>

      {/* Rod */}
      <Line
        points={[[0, 0, 0], [x, y, 0]]}
        color="#64748b"
        lineWidth={2}
      />

      {/* Bob */}
      <mesh position={[x, y, 0]}>
        <sphereGeometry args={[bobRadius, 32, 32]} />
        <meshStandardMaterial color="#0891b2" metalness={0.3} roughness={0.4} />
      </mesh>
    </group>
  );
};

export default SimplePendulum;
