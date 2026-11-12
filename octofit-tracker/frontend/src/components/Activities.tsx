import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

interface Activity {
  _id: string;
  user: string;
  team: string;
  type: string;
  minutes: number;
  points: number;
  occurredAt: string;
}

interface ActivitiesResponse {
  activities: Activity[];
}

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getJson<ActivitiesResponse>('/api/activities');
        setActivities(data.activities);
        setError(null);
      } catch (err) {
        setError((err as Error).message ?? 'Unable to load activities');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Activities</h2>
        <p>Track student activity minutes and points.</p>
        {loading && <p role="status">Loading...</p>}
        {error && <div role="alert" className="alert alert-danger">{error}</div>}
        {!loading && !error && activities.length === 0 && <p>No activities yet.</p>}
        {!loading && !error && activities.length > 0 && (
          <ul className="list-group">
            {activities.map((activity) => (
              <li key={activity._id} className="list-group-item">
                <strong>{activity.type}</strong> — {activity.minutes} minutes, {activity.points} points
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
