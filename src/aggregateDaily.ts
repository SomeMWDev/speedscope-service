import {
  aggregateSpeedscopeData, deleteAggregatedProfilesInTimeRange,
  getAggregatedProfilesInTimeRange, insertAggregatedProfile
} from "./repositories/profileRepository.js";

const end = Date.now();
const start = end - 24 * 60 * 60 * 1000; // 1 day ago

const aggregatedProfiles = await getAggregatedProfilesInTimeRange(
    start,
    end,
    'hourly'
);

if (aggregatedProfiles.length === 0) {
  console.log('No profiles found in the last day.');
  process.exit(0);
}

const aggregatedData = aggregateSpeedscopeData(
    aggregatedProfiles.map((p) => p.speedscopeData)
);
await insertAggregatedProfile(
    start,
    end,
    'daily',
    aggregatedProfiles.map((p) => p.profileCount)
      .reduce((a, b) => a + b, 0),
    JSON.stringify(aggregatedData),
);

await deleteAggregatedProfilesInTimeRange(0, end, 'hourly');
