# Study Partner Matcher

A web app that helps university students find compatible study partners in their courses. Students enter their availability and study habits, and the app uses OpenAI to score compatibility with other students in the same course.

---

## Features

- **Sign up / Log in** — JWT-based auth, bcrypt password hashing
- **Study info form** — enter your course, weekly availability (date + time blocks), and study habits
- **AI-powered matching** — GPT-4o-mini scores compatibility between students based on study habits and finds overlapping available times
- **Match results** — ranked list of up to 5 compatible study partners with shared time slots

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 15, TypeScript, Tailwind CSS |
| Backend | Node.js, Express |
| Database | MongoDB (Mongoose) |
| Auth | JWT + bcrypt |
| AI | OpenAI API (gpt-4o-mini) |
| Tests | Jest, Supertest, mongodb-memory-server |

---

## Project Structure

```
study-partner-matcher/
├── client/                  # Next.js frontend
│   └── src/
│       ├── app/
│       │   ├── (pages)/     # signup, login, homepage, studentinfo, matching-students, usermatching
│       │   └── layout.tsx
│       ├── context/
│       │   └── AuthContext.tsx
│       └── lib/
│           └── api.ts       # fetch wrapper (auto-injects Bearer token)
└── server/                  # Express backend
    ├── app.js               # Express app (no DB connect — importable by tests)
    ├── server.js            # DB connection + app.listen
    ├── controllers/
    │   ├── userController.js
    │   ├── courseController.js
    │   └── matchingController.js
    ├── models/
    │   ├── userModel.js
    │   └── courseModel.js
    ├── routes/
    │   ├── userRoute.js
    │   ├── courseRoute.js
    │   └── matchingRoute.js
    ├── middleware/
    │   └── requireAuth.js
    └── tests/
        ├── user.test.js
        └── course.test.js
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB instance (local or Atlas)
- OpenAI API key

### Server

```bash
cd server
cp .env.example .env
# Fill in MONGO_URI, SECRET, OPENAI_API_KEY in .env
npm install
npm run dev       # nodemon (watch mode)
# or
npm start         # plain node
```

### Client

```bash
cd client
npm install
npm run dev
```

The client runs on `http://localhost:3000`, the server on `http://localhost:4000`.

If your server runs on a different URL, set `NEXT_PUBLIC_API_URL` in the client environment.

---

## API Reference

All routes prefixed with `/api`.

### Auth (public)

| Method | Path | Body | Returns |
|---|---|---|---|
| POST | `/user/signup` | `{ userName, password, profileImage }` | `{ _id, userName, profileImage, token }` |
| POST | `/user/login` | `{ userName, password }` | `{ _id, userName, profileImage, ..., token }` |

### Users (requires `Authorization: Bearer <token>`)

| Method | Path | Description |
|---|---|---|
| GET | `/user` | All users |
| GET | `/user/:id` | Single user (populates courses) |
| PATCH | `/user/:id` | Update user fields |
| DELETE | `/user/:id` | Delete user |

### Courses (GET is public, mutations require auth)

| Method | Path | Body | Description |
|---|---|---|---|
| GET | `/course` | — | All courses |
| GET | `/course/:id` | — | Single course |
| POST | `/course` | `{ courseCode }` | Create course |
| PUT | `/course/:id` | `{ courseCode }` | Update course |
| DELETE | `/course/:id` | — | Delete course |
| POST | `/course/addStudent` | `{ courseID, userID }` | Enroll student |
| POST | `/course/removeStudent` | `{ courseID, userID }` | Unenroll student |

### Matching (requires auth)

| Method | Path | Body | Description |
|---|---|---|---|
| POST | `/match` | `{ courseCode, referenceStudentId }` | Returns up to 5 ranked compatible students with common time slots |

---

## Running Tests

Tests use an in-memory MongoDB instance — no real DB needed.

```bash
cd server
SECRET=any_secret npm test
```

22 integration tests covering signup, login, auth guards, CRUD, and enrollment logic.

---

## Environment Variables

See `server/.env.example`:

```
MONGO_URI=mongodb://localhost:27017/study-partner-matcher
SECRET=your_jwt_secret_here
OPENAI_API_KEY=sk-...
PORT=4000
```
