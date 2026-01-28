import type {
  SpeedscopeFile, SpeedscopeFrame,
} from '../models/speedscope.js';

/**
 * @param data Array of speedscope data to aggregate. Must contain at least one entry.
 */
export function aggregateSpeedscopeData(data: string[]): SpeedscopeFile {
  if (data.length === 0) {
    throw new Error('No data to aggregate!');
  }

  const globalFrames = new Map<string, number>();
  const globalFramesRev: SpeedscopeFrame[] = [];
  const globalSamples = new Map<string, number>();
  let json: SpeedscopeFile | undefined;

  data.forEach((rawData) => {
    json = JSON.parse(rawData) as SpeedscopeFile;
    const frames = json.shared.frames;
    const local2GlobalFrames = new Map<number, number>();
    frames.forEach((frame, i) => {
      const frameJson = JSON.stringify(frame);
      if (!globalFrames.has(frameJson)) {
        globalFrames.set(frameJson, globalFrames.size);
        globalFramesRev.push(frame);
      }
      local2GlobalFrames.set(i, globalFrames.get(frameJson)!);
    });

    for (const [i, sample] of json.profiles[0]!.samples.entries()) {
      const weight = json.profiles[0]!.weights[i]!;
      const mappedSample = sample.map((s: number) => local2GlobalFrames.get(s));
      const mappedSampleKey = mappedSample.join(',');
      globalSamples.set(
        mappedSampleKey,
        (globalSamples.get(mappedSampleKey) ?? 0) + weight,
      );
    }
  });

  const globalSort = new Map<string, number>();
  globalSamples.forEach((weight, sample) => {
    const arr = sample.split(',').map(Number);
    for (let i = 0; i < arr.length; i++) {
      const key = arr.slice(0, i).join(',');
      globalSort.set(key, (globalSort.get(key) ?? 0) + weight);
    }
  });

  const globalSortTuples = new Map<string, number[]>();

  for (const sample of globalSamples.keys()) {
    const arr = sample.split(',').map(Number);
    const values: number[] = [];
    for (let i = 0; i < arr.length; i++) {
      const key = arr.slice(0, i).join(',');
      values.push(-(globalSort.get(key) ?? 0));
    }

    globalSortTuples.set(sample, values);
  }

  const tuples = Array.from(globalSamples.entries());
  tuples.sort((a, b) => {
    const ta = globalSortTuples.get(a[0])!;
    const tb = globalSortTuples.get(b[0])!;
    for (let i = 0; i < Math.min(ta.length, tb.length); i++) {
      if (ta[i] !== tb[i]) return ta[i]! - tb[i]!;
    }
    return ta.length - tb.length;
  });

  json!.profiles[0]!.samples = tuples.map(([key]) => key.split(',').map(Number));
  json!.profiles[0]!.weights = tuples.map(([, weight]) => weight);
  json!.shared.frames = globalFramesRev;

  return json!;
}
