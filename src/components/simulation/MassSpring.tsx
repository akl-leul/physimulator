import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

interface MassSpringProps {
  mass: number;
  springConstant: number;
  damping: number;
  drivingFrequency: number;
  drivingAmplitude: number;
  initialDisplacement: number;
  isPlaying: boolean;
  onStateUpdate: (displacement: number, velocity: number) => void;
  showTrail?: boolean;
}

const MassSpring = ({
  mass,
  springConstant,
  damping,
  drivingFrequency,
  drivingAmplitude,
  initialDisplacement,
  isPlaying,
  onStateUpdate,
  showTrail = true,
}: MassSpringProps) => {
  const blockRef = useRef<THREE.Mesh>(null);
  const xRef = useRef(initialDisplacement);
  const vRef = useRef(0);
  const timeRef = useRef(0);
  const lastUpdateRef = useRef(0);

  const [trail, setTrail] = useState<[number, number, number][]>([]);
  const trailRef = useRef<[number, number, number][]>([]);

  useEffect(() => {
    if (!isPlaying) {
      xRef.current = initialDisplacement;
      vRef.current = 0;
      timeRef.current = 0;
      trailRef.current = [];
      setTrail([]);
    }
  }, [isPlaying, initialDisplacement]);

  useFrame((state, delta) => {
    if (!isPlaying) return;

    const dt = Math.min(delta, 0.02);
    timeRef.current += dt;

    const x = xRef.current;
    let v = vRef.current;
    const k = springConstant;
    const m = mass;
    const b = damping;
    const F0 = drivingAmplitude;
    const wd = drivingFrequency;

    // Spring equation: x'' = -(k/m)x - (b/m)x' + (F0/m)cos(wd*t)
    const drivingForce = F0 * Math.cos(wd * timeRef.current);
    const accel = -(k / m) * x - (b / m) * v + drivingForce / m;

    v += accel * dt;
    const newX = x + v * dt;

    xRef.current = newX;
    vRef.current = v;

    // Trail (vertical motion)
    if (showTrail) {
      trailRef.current.push([newX, 0, 0]);
      if (trailRef.current.length > 200) {
        trailRef.current = trailRef.current.slice(-200);
      }
      if (state.clock.elapsedTime - lastUpdateRef.current > 0.05) {
        setTrail([...trailRef.current]);
      }
    }

    if (state.clock.elapsedTime - lastUpdateRef.current > 0.016) {
      onStateUpdate(newX, v);
      lastUpdateRef.current = state.clock.elapsedTime;
    }
  });

  const displacement = xRef.current;
  const blockSize = 0.3 + mass * 0.05;
  
  // Spring coils
  const springCoils = [];
  const coilCount = 12;
  const springLength = 1.5;
  const startX = -2;
  const endX = startX + springLength + displacement;
  
  for (let i = 0; i <= coilCount * 4; i++) {
    const t = i / (coilCount * 4);
    const x = startX + t * (endX - startX);
    const y = Math.sin(t * coilCount * Math.PI * 2) * 0.15;
    springCoils.push([x, y, 0] as [number, number, number]);
  }

  // Resonance detection
  const naturalFreq = Math.sqrt(springConstant / mass);
  const isNearResonance = Math.abs(drivingFrequency - naturalFreq) < 0.5 && drivingAmplitude > 0;
  const blockColor = isNearResonance ? '#ef4444' : '#0891b2';

  return (
    <group>
      {/* Wall */}
      <mesh position={[-2.3, 0, 0]}>
        <boxGeometry args={[0.1, 1.5, 0.5]} />
        <meshStandardMaterial color="#374151" />
      </mesh>

      {/* Spring */}
      <Line
        points={springCoils}
        color="#64748b"
        lineWidth={2}
      />

      {/* Mass block */}
      <mesh position={[startX + springLength + displacement + blockSize / 2, 0, 0]} ref={blockRef}>
        <boxGeometry args={[blockSize, blockSize, blockSize]} />
        <meshStandardMaterial color={blockColor} metalness={0.3} roughness={0.4} />
      </mesh>

      {/* Resonance glow */}
      {isNearResonance && (
        <mesh position={[startX + springLength + displacement + blockSize / 2, 0, 0]}>
          <boxGeometry args={[blockSize * 1.3, blockSize * 1.3, blockSize * 1.3]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.1} />
        </mesh>
      )}

      {/* Ground line */}
      <Line
        points={[[-3, -blockSize / 2 - 0.02, 0], [3, -blockSize / 2 - 0.02, 0]]}
        color="#94a3b8"
        lineWidth={1}
      />

      {/* Equilibrium marker */}
      <Line
        points={[[startX + springLength + blockSize / 2, -0.6, 0], [startX + springLength + blockSize / 2, 0.6, 0]]}
        color="#94a3b8"
        lineWidth={1}
        dashed
        dashSize={0.05}
        gapSize={0.05}
      />
    </group>
  );
};

export default MassSpring;
