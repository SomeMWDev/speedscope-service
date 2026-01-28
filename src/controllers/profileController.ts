import type { NextFunction, Request, Response } from 'express';
import type {AggregatedProfileType, Profile} from '../models/profile.ts';
import {
  getLastAggregatedProfile,
  getProfileById,
  insertProfile,
  profileExists,
} from '../repositories/profileRepository.ts';
import config from '../config/config.ts';
import { timingSafeEqual } from 'node:crypto';

function isAuthenticated(req: Request): boolean {
  const auth = req.headers.authorization;
  const expected = `Bearer ${config.logToken}`;
  if (!auth) return false;
  const authBuffer = Buffer.from(auth);
  const expectedBuffer = Buffer.from(expected);
  if (authBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(authBuffer, expectedBuffer);
}

export const logProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!isAuthenticated(req)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const {
      id,
      wiki,
      url,
      cfRay,
      forced,
      speedscopeData,
      parserReport,
      environment,
    } = req.body;
    // TODO properly validate params

    const exists = await profileExists(id);
    if (exists) {
      return res
        .status(409)
        .json({ error: 'Profile with this ID already exists' });
    }

    const newProfile: Profile = {
      id,
      wiki,
      url,
      cfRay,
      forced,
      speedscopeData,
      parserReport,
      timestamp: Date.now(),
      environment,
    };

    await insertProfile(newProfile);
    res.status(201).json(newProfile);
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.query;

    const profile = await getProfileById(id as string);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.status(200).json(JSON.parse(profile.speedscopeData));
  } catch (error) {
    next(error);
  }
};

export const aggregate = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { type } = req.query;
    const aggregatedProfile = await getLastAggregatedProfile(type as AggregatedProfileType);
    if (!aggregatedProfile) {
      return res.status(404).json({ error: 'No aggregated profiles found' });
    }
    res.status(200).json(JSON.parse(aggregatedProfile.speedscopeData));
  } catch (error) {
    next(error);
  }
};
