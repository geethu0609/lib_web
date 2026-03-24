# ExamGuard — AI-Powered Exam Invigilation System

## Prerequisites
- Node.js >= 18
- MongoDB running locally on port 27017

## Setup & Run

### 1. Start MongoDB
Make sure MongoDB is running locally:
```
mongod
```

### 2. Backend
```bash
cd backend
npm install
npm run seed      # Creates demo users in DB
npm run dev       # Starts server on http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev       # Starts Vite on http://localhost:5173
```

## Demo Credentials

| Role    | Email                      | Password    |
|---------|----------------------------|-------------|
| Admin   | admin@university.edu       | admin123    |
| Faculty | sarah@university.edu       | faculty123  |
| Faculty | michael@university.edu     | faculty123  |
| Faculty | priya@university.edu       | faculty123  |

## Workflow

1. **Login as Admin** → Create a channel (exam name, date, time)
2. **Add Rooms** → Assign faculty to each room → Save Channel
3. **Login as Faculty** → See assigned rooms in "My Assignments"
4. **Click Activate** → Room becomes active, monitoring starts
5. **Click "Simulate AI Alert"** → Mock malpractice event generated
6. **Dismiss** or **Inform Admin** on each event
7. **Admin** sees all reports under "Malpractice Reports" tab

## API Endpoints

| Method | Endpoint                        | Role    | Description              |
|--------|---------------------------------|---------|--------------------------|
| POST   | /api/auth/login                 | Public  | Login                    |
| POST   | /api/admin/channels             | Admin   | Create channel           |
| POST   | /api/admin/channels/:id/rooms   | Admin   | Add rooms to channel     |
| GET    | /api/admin/channels             | Admin   | Get all channels         |
| GET    | /api/admin/malpractice          | Admin   | Get all reports          |
| GET    | /api/admin/faculty-users        | Admin   | List faculty users       |
| GET    | /api/faculty/channels           | Faculty | Get assigned channels    |
| POST   | /api/faculty/rooms/:id/activate | Faculty | Activate a room          |
| GET    | /api/faculty/rooms/:id/events   | Faculty | Get room events          |
| POST   | /api/faculty/events/:id/dismiss | Faculty | Dismiss event            |
| POST   | /api/faculty/events/:id/inform  | Faculty | Inform admin             |
| GET    | /api/notifications              | Both    | Get notifications        |
| PATCH  | /api/notifications/:id/read     | Both    | Mark notification read   |
| POST   | /api/ai/mock-event/:roomId      | Both    | Generate mock AI event   |
