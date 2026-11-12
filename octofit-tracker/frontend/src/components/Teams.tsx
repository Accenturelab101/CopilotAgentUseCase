import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

interface Team {
  _id: string;
  name: string;
  mascot: string;
  members: string[];
}

interface TeamsResponse {
  teams: Team[];
}

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getJson<TeamsResponse>('/api/teams');
        setTeams(data.teams);
        setError(null);
      } catch (err) {
        setError((err as Error).message ?? 'Unable to load teams');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">Teams</h2>
        <p>Manage teams and members.</p>
        {loading && <p role="status">Loading...</p>}
        {error && <div role="alert" className="alert alert-danger">{error}</div>}
        {!loading && !error && teams.length === 0 && <p>No teams yet.</p>}
        {!loading && !error && teams.length > 0 && (
          <div className="list-group">
            {teams.map((team) => (
              <div key={team._id} className="list-group-item">
                <h3 className="h6">{team.name}</h3>
                <p className="mb-2"><small>Mascot: {team.mascot}</small></p>
                <p className="mb-0"><small>{team.members.length} member{team.members.length !== 1 ? 's' : ''}</small></p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
