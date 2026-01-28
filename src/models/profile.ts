export interface Profile {
  id: string;
  timestamp: number;
  wiki: string;
  url: string;
  cfRay: string;
  forced: boolean;
  speedscopeData: string;
  parserReport: string | null;
  environment: string;
}

export type AggregatedProfileType = 'hourly' | 'daily';

export interface AggregatedProfile {
  id: number;
  startTime: number;
  endTime: number;
  type: AggregatedProfileType;
  profileCount: number;
  speedscopeData: string;
}

// https://github.com/jlfwong/speedscope/blob/main/src/lib/file-format-spec.ts

export interface SpeedscopeFrame {
  name: string;
  file?: string;
  line?: number;
  col?: number;
}

// Simplified since we don't need all of the fields
export interface SpeedscopeProfile {
  samples: number[][];
  weights: number[];
}

export interface SpeedscopeFile {
  shared: {
    frames: SpeedscopeFrame[];
  };
  profiles: SpeedscopeProfile[];
}
