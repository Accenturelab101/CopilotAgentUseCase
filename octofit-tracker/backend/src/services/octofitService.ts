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

export async function createTeam(input: unknown) {
  const data = input as Record<string, unknown>;
  
  // Validate required fields
  if (!data.name) {
    throw Object.assign(new Error('Team name is required'), { status: 400 });
  }
  if (!data.mascot) {
    throw Object.assign(new Error('Team mascot is required'), { status: 400 });
  }
  
  const team = await Team.create({
    name: data.name,
    mascot: data.mascot,
    members: Array.isArray(data.members) ? data.members : [],
  });
  
  return team.toObject();
}

export async function getLeaderboard() {
  const activities = await Activity.find().populate('team').lean();
  
  // Sum points by team
  const teamPoints = new Map<string, { name: string; points: number }>();
  for (const activity of activities) {
    const teamId = String((activity.team as any)._id);
    const teamName = (activity.team as any).name;
    const current = teamPoints.get(teamId) ?? { name: teamName, points: 0 };
    teamPoints.set(teamId, { name: teamName, points: current.points + activity.points });
  }
  
  // Convert to array and sort by points (descending)
  const sorted = Array.from(teamPoints.values())
    .sort((a, b) => b.points - a.points)
    .map((team, index) => ({
      teamName: team.name,
      totalPoints: team.points,
      rank: index + 1,
    }));
  
  return sorted;
}

export async function suggestWorkouts(userEmail: string) {
  const decodedEmail = decodeURIComponent(userEmail);
  
  // Find user by email
  const user = await User.findOne({ email: decodedEmail }).lean();
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }
  
  // Get user's recent activities to analyze patterns
  const activities = await Activity.find({ user: user._id }).sort({ occurredAt: -1 }).limit(10).lean();
  
  // Determine suggestion focus based on goal or recent activity
  let suggestFocus = user.fitnessGoal;
  if (activities.length > 0) {
    // If user has recent activities of a specific type, prefer that
    const activityTypes = activities.map(a => a.type);
    // For simplicity, use the most recent activity type or fall back to fitness goal
    if (activityTypes[0] === 'run' || activityTypes[0] === 'cycling') {
      suggestFocus = 'endurance';
    } else if (activityTypes[0] === 'strength') {
      suggestFocus = 'strength';
    }
  }
  
  // Find workouts matching the focus
  const workouts = await Workout.find({ focus: suggestFocus }).lean();
  
  // Add reason to each suggestion
  const suggestions = workouts.map(workout => ({
    ...workout,
    reason: activities.length > 0 
      ? `Based on your recent ${activities[0].type} activity and ${user.fitnessGoal} goal`
      : `Based on your ${user.fitnessGoal} fitness goal`,
  }));
  
  return suggestions;
}

export { User };
