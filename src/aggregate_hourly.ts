import {
  aggregateProfiles,
  deleteProfilesInTimeRange,
  getProfilesInTimeRange,
  insertAggregatedProfile,
} from './repositories/profileRepository.js';

const end = Date.now();
const start = end - 60 * 60 * 1000; // 1 hour ago

const profiles = await getProfilesInTimeRange(start, end);

const aggregatedData = aggregateProfiles(profiles);
await insertAggregatedProfile(
  start,
  end,
  'hourly',
  profiles.length,
  JSON.stringify(aggregatedData),
);

// Delete all profiles (except for forced ones) that were created before this script has started
// running. This way we ensure there aren't any orphaned ones remaining in the DB
await deleteProfilesInTimeRange(0, end);
