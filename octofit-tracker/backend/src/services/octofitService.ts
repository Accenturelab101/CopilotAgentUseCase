import { Activity, Team, User, Workout } from '../models/index.js';

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  const data = input as Record<string, unknown>;
  
  // Validate required fields
  if (!data.userId || !data.teamId || !data.type || data.minutes === undefined) {
    throw Object.assign(new Error('Missing required fields: userId, teamId, type, minutes'), { status: 400 });
  }
  
  // Validate and parse ObjectIds
  let userId: string;
  let teamId: string;
  try {
    userId = String(data.userId);
    teamId = String(data.teamId);
    if (!userId.match(/^[0-9a-f]{24}$/i) || !teamId.match(/^[0-9a-f]{24}$/i)) {
      throw new Error('Invalid ObjectId format');
    }
  } catch {
    throw Object.assign(new Error('Invalid userId or teamId format'), { status: 400 });
  }
  
  // Validate references exist
  const user = await User.findById(userId);
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 400 });
  }
  
  const team = await Team.findById(teamId);
  if (!team) {
    throw Object.assign(new Error('Team not found'), { status: 400 });
  }
  
  // Create activity with computed fields
  const activity = await Activity.create({
    user: userId,
    team: teamId,
    type: data.type,
    minutes: Number(data.minutes),
    points: Number(data.minutes),
    occurredAt: new Date(),
  });
  
  return activity.toObject();
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(_input: unknown) {
  throw Object.assign(new Error('Team validation is not implemented yet'), { status: 501 });
}

export async function getLeaderboard() {
  return [];
}

export async function suggestWorkouts(_userEmail: string) {
  return Workout.find().limit(1).lean();
}

export { User };
