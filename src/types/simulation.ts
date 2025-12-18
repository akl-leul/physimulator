export type SimulationMode = 
  | 'simple' 
  | 'double' 
  | 'damped' 
  | 'spring'
  | 'coupled';

export interface Preset {
  id: string;
  name: string;
  description: string;
  mode: SimulationMode;
  application: string;
  icon: string;
  params: Partial<SimulationParams>;
}

export interface Application {
  id: string;
  name: string;
  description: string;
  icon: string;
  relatedModes: SimulationMode[];
}

export interface SimulationState {
  angle: number;
  angularVelocity: number;
  angle2?: number;
  angularVelocity2?: number;
  displacement?: number;
  velocity?: number;
}

export interface TrailPoint {
  x: number;
  y: number;
  time: number;
}

export interface PhasePoint {
  angle: number;
  velocity: number;
  time: number;
}

export interface DataPoint {
  time: number;
  angle: number;
  velocity: number;
  ke: number;
  pe: number;
  angle2?: number;
  velocity2?: number;
}

export interface SimulationParams {
  length: number;
  length2?: number;
  mass: number;
  mass2?: number;
  gravity: number;
  initialAngle: number;
  initialAngle2?: number;
  damping?: number;
  drivingFrequency?: number;
  drivingAmplitude?: number;
  springConstant?: number;
  initialDisplacement?: number;
}
