import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

interface Workout {
  _id: string;
  title: string;
  focus: string;
  minutes: number;
  difficulty: string;
  reason?: string;
}

interface WorkoutsResponse {
  suggestions: Workout[];
}

export default function Workouts() {
  const [suggestions, setSuggestions] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const userEmail = encodeURIComponent('mona@example.com');
        const data = await getJson<WorkoutsResponse>(`/api/workouts/suggestions/${userEmail}`);
        setSuggestions(data.suggestions);
        setError(null);
      } catch (err) {
        setError((err as Error).message ?? 'Unable to load workout suggestions');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Workout suggestions</h2>
        <p>Recommend workouts from activity patterns.</p>
        {loading && <p role="status">Loading...</p>}
        {error && <div role="alert" className="alert alert-danger">{error}</div>}
        {!loading && !error && suggestions.length === 0 && <p>No workout suggestions available.</p>}
        {!loading && !error && suggestions.length > 0 && (
          <div className="list-group">
            {suggestions.map((workout) => (
              <div key={workout._id} className="list-group-item">
                <h3 className="h6">{workout.title}</h3>
                <p className="mb-2"><small>Focus: {workout.focus} • Difficulty: {workout.difficulty} • {workout.minutes} min</small></p>
                {workout.reason && <p className="mb-0"><small className="text-muted">Why: {workout.reason}</small></p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
