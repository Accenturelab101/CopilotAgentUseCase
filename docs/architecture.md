# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

Record your plan here before editing code.

- Presentation tier decision: Use React 19 components with React Router, Bootstrap styling, and `src/api/client.ts` for API calls. Show loading, empty, success, and error states.
- Logic tier decision: Use Express with TypeScript routes under `/api/`, explicit service functions for business logic, and deliberate 4xx responses (never 500 from validation/cast errors).
- Data tier decision: Use Mongoose schemas with built-in validation, store stable demo records with upserts, and keep model constraints in schemas separate from route handlers.
- Activity tracking approach: POST validates userId/teamId existence (reject 4xx if missing), auto-computes points and occurredAt timestamp, stores valid records.
- Team management approach: POST validates name presence (reject 400 if missing), GET returns teams with populated members array.
- Leaderboard approach: Query all activities, sum points by team, rank highest-to-lowest, return with teamName, totalPoints, rank.
- Workout suggestions approach: Find user by email, analyze their recent activity types/goals, recommend workouts matching their pattern, include reason field explaining the recommendation.

## Test plan

Record the commands you run and what each failure means.

- Data-tier command: `npm run test:data --prefix octofit-tracker/backend` — Verifies User, Team, Activity, Workout schemas have required field validation and reject invalid data.
- API command: `npm run test:api --prefix octofit-tracker/backend` — Verifies endpoints return correct status codes (400 for validation, 201 for create, 200 for read), compute fields correctly, and implement leaderboard/suggestion logic.
- Frontend command: `npm test --prefix octofit-tracker/frontend` — Verifies components fetch from API, render activity data, show loading/empty/error states, and display leaderboard and suggestions.
- Backend build command: `npm run build --prefix octofit-tracker/backend` — Ensures TypeScript compiles without errors.
- Frontend build command: `npm run build --prefix octofit-tracker/frontend` — Ensures React/Vite build succeeds without errors.

## Completion status

✅ **All tiers implemented and tested** - Ready for final grading and deployment.
