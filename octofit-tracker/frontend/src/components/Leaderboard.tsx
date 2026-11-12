import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

interface LeaderboardEntry {
  teamName: string;
  totalPoints: number;
  rank: number;
}

interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getJson<LeaderboardResponse>('/api/leaderboard');
        setLeaderboard(data.leaderboard);
        setError(null);
      } catch (err) {
        setError((err as Error).message ?? 'Unable to load leaderboard');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Leaderboard</h2>
        <p>Compare team point totals.</p>
        {loading && <p role="status">Loading...</p>}
        {error && <div role="alert" className="alert alert-danger">{error}</div>}
        {!loading && !error && leaderboard.length === 0 && <p>No leaderboard rankings yet.</p>}
        {!loading && !error && leaderboard.length > 0 && (
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Team</th>
                <th>Total Points</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry) => (
                <tr key={entry.rank}>
                  <td>{entry.rank}</td>
                  <td>{entry.teamName}</td>
                  <td>{entry.totalPoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
