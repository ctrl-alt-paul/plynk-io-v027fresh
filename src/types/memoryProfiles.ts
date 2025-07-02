
export interface MemoryProfileOutput {
  label: string;
  type: string;
  address: string;
  notes: string;
  invert: boolean;
  format: string;
  script: string;
  useModuleOffset: boolean;
  moduleName: string;
  offset: string;
  offsets?: string[];
  bitmask: string;
  bitwiseOp: "" | "AND" | "OR" | "XOR" | "NOT";
  bitfield: boolean;
  isPointerChain: boolean;
  source?: "user" | "profile" | "community";
}

export interface MemoryProfile {
  id: string;
  fileName: string;
  process: string;
  pollInterval: number;
  outputs: MemoryProfileOutput[];
  lastModified: number;
  outputCount: number;
  memoryProfileType: 'user' | 'community' | 'profile' | 'default';
  content?: string;
}
