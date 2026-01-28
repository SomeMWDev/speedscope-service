import type {
  AggregatedProfile,
  AggregatedProfileType,
  Profile,
} from '../models/profile.ts';
import { getDb } from '../db/database.ts';
import { gunzipSync, gzipSync } from 'node:zlib';

export async function insertProfile(profile: Profile): Promise<void> {
  const db = await getDb();

  await db.run(
    `
      INSERT INTO profiles (
          id,
          timestamp,
          wiki,
          url,
          cf_ray,
          forced,
          speedscope_data,
          parser_report,
          environment
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
    profile.id,
    profile.timestamp,
    profile.wiki,
    profile.url,
    profile.cfRay,
    profile.forced ? 1 : 0,
    gzipSync(profile.speedscopeData),
    profile.parserReport,
    profile.environment,
  );
}

export async function profileExists(id: string): Promise<boolean> {
  const db = await getDb();

  const row = await db.get<{ count: number }>(
    `
      SELECT COUNT(*) as count
      FROM profiles
      WHERE id = ?
      `,
    id,
  );

  return (row?.count ?? 0) > 0;
}

export async function getProfileById(id: string): Promise<Profile | null> {
  const db = await getDb();

  const row = await db.get<{
    id: string;
    timestamp: number;
    wiki: string;
    url: string;
    cf_ray: string;
    forced: number;
    speedscope_data: Buffer;
    parser_report: string | null;
    environment: string;
  }>(
    `
      SELECT *
      FROM profiles
      WHERE id = ?
      `,
    id,
  );

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    timestamp: row.timestamp,
    wiki: row.wiki,
    url: row.url,
    cfRay: row.cf_ray,
    forced: row.forced === 1,
    speedscopeData: gunzipSync(row.speedscope_data).toString(),
    parserReport: row.parser_report,
    environment: row.environment,
  };
}

export async function getProfilesInTimeRange(
  startTime: number,
  endTime: number,
): Promise<Profile[]> {
  const db = await getDb();
  const rows = await db.all<
    {
      id: string;
      timestamp: number;
      wiki: string;
      url: string;
      cf_ray: string;
      forced: number;
      speedscope_data: Buffer;
      parser_report: string | null;
      environment: string;
    }[]
  >(
    `
      SELECT *
      FROM profiles
      WHERE timestamp BETWEEN ? AND ?
      AND forced = 0
      ORDER BY timestamp ASC
      `,
    startTime,
    endTime,
  );

  return rows.map((row) => ({
    id: row.id,
    timestamp: row.timestamp,
    wiki: row.wiki,
    url: row.url,
    cfRay: row.cf_ray,
    forced: row.forced === 1,
    speedscopeData: gunzipSync(row.speedscope_data).toString(),
    parserReport: row.parser_report,
    environment: row.environment,
  }));
}

export async function deleteProfilesInTimeRange(
  startTime: number,
  endTime: number,
): Promise<void> {
  const db = await getDb();
  await db.run(
    `
      DELETE FROM profiles
      WHERE timestamp BETWEEN ? AND ?
      AND forced = 0
      `,
    startTime,
    endTime,
  );
}

/**
 * @param data Array of speedscope data to aggregate. Must contain at least one entry.
 */
export function aggregateSpeedscopeData(data: string[]): any {
  if (data.length === 0) {
    throw new Error('No data to aggregate!');
  }

  const globalFrames = new Map<string, number>();
  const globalFramesRev: object[] = [];
  const globalSamples = new Map<string, number>();
  let json = undefined;

  data.forEach((rawData) => {
    json = JSON.parse(rawData);
    const frames: any[] = json.shared.frames;
    const local2GlobalFrames = new Map<number, number>();
    frames.forEach((frame, i) => {
      const frameJson = JSON.stringify(frame);
      if (!globalFrames.has(frameJson)) {
        globalFrames.set(frameJson, globalFrames.size);
        globalFramesRev.push(frame);
      }
      local2GlobalFrames.set(i, globalFrames.get(frameJson)!);
    });

    for (const [i, sample] of json.profiles[0].samples.entries()) {
      const weight = json.profiles[0].weights[i];
      const mappedSample = sample
        .slice(1)
        .map((s: any) => local2GlobalFrames.get(s));
      const mappedSampleKey = mappedSample.join(',');
      globalSamples.set(
        mappedSampleKey,
        (globalSamples.get(mappedSampleKey) ?? 0) + weight,
      );
    }
  });

  const globalSort = new Map<any, number>();
  globalSamples.forEach((weight, sample) => {
    const arr = sample.split(',').map(Number);
    for (let i = 0; i < arr.length; i++) {
      const key = arr.slice(0, i).join(',');
      globalSort.set(key, (globalSort.get(key) ?? 0) + weight);
    }
  });

  const globalSortTuples = new Map<any, number[]>();

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

  json!.profiles[0].samples = tuples.map(([key]) => key.split(',').map(Number));
  json!.profiles[0].weights = tuples.map(([_, weight]) => weight);
  json!.shared.frames = globalFramesRev;

  return json;
}

export async function insertAggregatedProfile(
  startTime: number,
  endTime: number,
  type: AggregatedProfileType,
  profileCount: number,
  speedscopeData: string,
): Promise<void> {
  const db = await getDb();

  await db.run(
    `
      INSERT INTO aggregated_profiles (
          start_time,
          end_time,
          type,
          profile_count,
          speedscope_data
      ) VALUES (?, ?, ?, ?, ?)
      `,
    startTime,
    endTime,
    type,
    profileCount,
    gzipSync(speedscopeData),
  );
}

export async function getLastAggregatedProfile(
  type: AggregatedProfileType,
): Promise<AggregatedProfile | null> {
  const db = await getDb();

  return db
    .get<{
      id: number;
      start_time: number;
      end_time: number;
      type: AggregatedProfileType;
      profile_count: number;
      speedscope_data: Buffer;
    }>(
      `
      SELECT *
      FROM aggregated_profiles
      WHERE type = ?
      ORDER BY end_time DESC
      LIMIT 1
      `,
      type,
    )
    .then((row) => {
      if (!row) {
        return null;
      }

      return {
        id: row.id,
        startTime: row.start_time,
        endTime: row.end_time,
        type: row.type,
        profileCount: row.profile_count,
        speedscopeData: gunzipSync(row.speedscope_data).toString(),
      };
    });
}

export async function getAggregatedProfilesInTimeRange(
  startTime: number,
  endTime: number,
  type: AggregatedProfileType,
): Promise<AggregatedProfile[]> {
  const db = await getDb();
  const rows = await db.all<
    {
      id: number;
      start_time: number;
      end_time: number;
      type: AggregatedProfileType;
      profile_count: number;
      speedscope_data: Buffer;
    }[]
  >(
    `
      SELECT *
      FROM aggregated_profiles
      WHERE start_time >= ? AND end_time <= ?
      AND type = ?
      ORDER BY start_time ASC
      `,
    startTime,
    endTime,
    type,
  );

  return rows.map((row) => ({
    id: row.id,
    startTime: row.start_time,
    endTime: row.end_time,
    type: row.type,
    profileCount: row.profile_count,
    speedscopeData: gunzipSync(row.speedscope_data).toString(),
  }));
}

export async function deleteAggregatedProfilesInTimeRange(
  startTime: number,
  endTime: number,
  type: AggregatedProfileType,
): Promise<void> {
  const db = await getDb();
  await db.run(
    `
      DELETE FROM aggregated_profiles
      WHERE start_time >= ? AND end_time <= ?
      AND type = ?
      `,
    startTime,
    endTime,
    type,
  );
}
