/* Tipos dos modelos 3D importados. Recortado do original: só as interfaces,
   sem os modelos prontos (que o estúdio não usava). */
export interface PathCommand {
  op: 'move' | 'line' | 'quad' | 'bezier' | 'arc';
  x: number;
  y: number;
  cpX?: number;
  cpY?: number;
  cp1X?: number;
  cp1Y?: number;
  cp2X?: number;
  cp2Y?: number;
  radius?: number;
  startAngle?: number;
  endAngle?: number;
}

export interface ExtrudePart {
  type: 'extrude';
  shape?: PathCommand[];
  depth?: number;
  bevelEnabled?: boolean;
  bevelSize?: number;
  bevelThickness?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

export interface SpherePart {
  type: 'sphere';
  radius: number;
  phiLength?: number;
  thetaStart?: number;
  thetaLength?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

export interface CylinderPart {
  type: 'cylinder';
  radiusTop: number;
  radiusBottom: number;
  height: number;
  radialSegments?: number;
  thetaStart?: number;
  thetaLength?: number;
  phiLength?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

export interface BoxPart {
  type: 'box';
  width: number;
  height: number;
  depth: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

export interface TorusPart {
  type: 'torus';
  radius: number;
  tube: number;
  arc?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

export interface CapsulePart {
  type: 'capsule';
  radius: number;
  length: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

export interface ConePart {
  type: 'cone';
  radius: number;
  height: number;
  radialSegments?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

export type Model3DPart =
  | ExtrudePart
  | SpherePart
  | CylinderPart
  | BoxPart
  | TorusPart
  | CapsulePart
  | ConePart;

export interface Custom3DModel {
  id: string;
  name: string;
  prompt: string;
  description?: string;
  parts: Model3DPart[];
  gltfUrl?: string;
  importedScene?: any;
}

