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
