CoachAssist CRM
A mini CRM for wellness coaches to manage leads, generate AI follow-ups, and view activity timelines.
Tech Stack
Frontend: Next.js (App Router) + Tailwind CSS
Backend: Node.js + Express
Database: MongoDB (Mongoose)
Cache / Queue: Redis (Upstash)
AI: Google Gemini API
---
Setup
1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/coachassist.git
cd coachassist
```
2. Backend setup
```bash
cd backend
npm install
```
Create `backend/.env`:
```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/CoachAssist
JWT_SECRET=your_jwt_secret
REDIS_URL=rediss://default:password@host:6379
GEMINI_API_KEY=your_gemini_api_key
```
```bash
nodemon server
```
3. Frontend setup
```bash
cd frontend
npm install
npm run dev
```
---
MongoDB Indexes
Collection	Index	Reason
leads	`{ status: 1 }`	Filter leads by status
leads	`{ assignedTo: 1 }`	Per-coach queries
leads	`{ nextFollowUpAt: 1 }`	Overdue follow-up queries
leads	`{ name: "text", phone: "text" }`	Full-text search
activities	`{ lead: 1, createdAt: -1 }`	Timeline pagination (most critical)
---
Architecture
Collections
users — coach accounts with hashed passwords
leads — lead profiles with status, source, tags, follow-up date
activities — all interactions per lead (calls, notes, AI messages)
Caching Strategy
Dashboard analytics cached in Redis with key `dashboard:{userId}:{date}`
TTL: 120 seconds
AI generation rate limited to 5 requests per user per hour using Redis counters
Cursor Pagination
Timeline uses cursor-based pagination (not page numbers) for efficiency:
First request: `GET /leads/:id/timeline?limit=10`
Next page: `GET /leads/:id/timeline?cursor=<timestamp>&limit=10`
---
API Examples
Register
```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Coach","email":"coach@test.com","password":"123456"}'
```
Login
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"coach@test.com","password":"123456"}'
```
Create Lead
```bash
curl -X POST http://localhost:5000/leads \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"John","phone":"9999999999","source":"Instagram","status":"NEW","tags":["yoga"]}'
```
Get Dashboard
```bash
curl http://localhost:5000/dashboard \
  -H "Authorization: Bearer TOKEN"
```
Get Timeline
```bash
curl "http://localhost:5000/leads/LEAD_ID/timeline?limit=10" \
  -H "Authorization: Bearer TOKEN"
```
Generate AI Follow-up
```bash
curl -X POST http://localhost:5000/leads/LEAD_ID/ai-followup \
  -H "Authorization: Bearer TOKEN"
```
---
Features
JWT Authentication
Lead CRUD with filters (status, tags, search)
Cursor-based activity timeline pagination
Dashboard with MongoDB aggregation pipelines
Redis caching for dashboard
Redis rate limiting for AI (5 req/hour)
Gemini AI generates WhatsApp message, call script, objection handler
