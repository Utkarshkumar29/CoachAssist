# CoachAssist CRM

A CRM built for wellness coaches to track leads, log interactions, and generate AI-powered follow-ups using Google Gemini. Built as a full-stack assignment using Next.js, Express, MongoDB, and Redis.

---

## What it does

- Coaches can sign up, log in, and manage their own leads
- Each lead has a status funnel (New → Contacted → Interested → Converted/Lost)
- You can log calls, WhatsApp messages, and notes against any lead
- The AI follow-up button generates a WhatsApp message, call script, and objection handler using Gemini
- A dashboard shows conversion rates, overdue follow-ups, top sources, and a 7-day activity graph
- Everything is paginated properly and the dashboard is cached with Redis

---

## Stack

- **Next.js** (App Router) + Tailwind for the frontend
- **Node.js + Express** for the API
- **MongoDB + Mongoose** for the database
- **Redis (Upstash)** for caching and rate limiting
- **Google Gemini** for AI follow-up generation

---

## Getting Started

You'll need MongoDB Atlas, an Upstash Redis instance, and a Gemini API key before running this locally.

### Backend

```bash
cd backend
npm install
```

Create a `.env` file in the backend folder:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/CoachAssist
JWT_SECRET=pick_any_long_random_string
REDIS_URL=rediss://default:password@your-upstash-host:6379
GEMINI_API_KEY=your_gemini_key_here
```

Then start the server:

```bash
nodemon server
```

It runs on port 5000.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on port 3000. Open http://localhost:3000 and you'll be redirected to the login page.

---

## MongoDB Collections & Indexes

I used two main collections — `leads` and `activities` — kept separate so the timeline can be paginated efficiently without loading the entire lead document.

### Leads
| Index | Why |
|---|---|
| `{ status: 1 }` | Filtering leads by status |
| `{ assignedTo: 1 }` | Every query is scoped to a coach |
| `{ nextFollowUpAt: 1 }` | Finding overdue follow-ups in the dashboard |
| `{ name: "text", phone: "text" }` | Search by name or phone number |

### Activities
| Index | Why |
|---|---|
| `{ lead: 1, createdAt: -1 }` | The most important one — makes timeline fetch fast by combining lead filter + date sort in a single index |

---

## Caching Strategy

The dashboard aggregations are expensive (5 parallel queries), so I cache the result in Redis:

- **Key format**: `dashboard:{userId}:{date}`
- **TTL**: 120 seconds
- On the first request, it runs all the aggregations and stores the result
- Subsequent requests within 120s return instantly from cache
- AI generation is rate limited to 5 requests per user per hour using Redis counters with auto-expiry

---

## Timeline Pagination

I used cursor-based pagination instead of page numbers because it handles live data better. If a new activity is added while someone is scrolling, they won't see duplicates or miss entries.

- First page: `GET /leads/:id/timeline?limit=10`
- Next page: `GET /leads/:id/timeline?cursor=<timestamp>&limit=10`
- The cursor is the `createdAt` timestamp of the last item returned

---

## API Examples

**Register**
```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Coach Name","email":"coach@example.com","password":"yourpassword"}'
```

**Login**
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"coach@example.com","password":"yourpassword"}'
```

**Create a lead**
```bash
curl -X POST http://localhost:5000/leads \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","phone":"9999999999","source":"Instagram","tags":["yoga","morning"]}'
```

**Get leads with filters**
```bash
curl "http://localhost:5000/leads?status=NEW&search=john" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Get timeline**
```bash
curl "http://localhost:5000/leads/LEAD_ID/timeline?limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Generate AI follow-up**
```bash
curl -X POST http://localhost:5000/leads/LEAD_ID/ai-followup \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Dashboard**
```bash
curl http://localhost:5000/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Project Structure

```
coachassist/
  backend/
    src/
      controllers/    → auth, lead, activity, dashboard, aiFollowup
      models/         → User, Lead, Activity
      routes/         → auth, lead, activity, dashboard
      middleware/     → auth (JWT), rateLimiter (Redis)
      services/       → redis, gemini
  frontend/
    src/
      app/
        login/        → login + register
        dashboard/    → analytics
        leads/        → lead list with filters
        leads/[id]/   → lead detail, timeline, AI followup
      lib/
        api.js        → fetch wrapper with auth headers
```
