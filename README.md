# TaskFlow Backend

TaskFlow Backend is a simple Node.js + Express + Prisma-based backend that provides APIs for user authentication, project management, and task tracking.

---

## Getting Started

Follow the steps below to run the backend locally.

### Clone the Repository

```bash
git clone https://github.com/VanshikaSabharwal/taskflow-backend.git
cd taskflow-backend
```

### Install Dependencies

Make sure you have Node.js (v18 or later) installed.

```bash
npm install
```

### Set Up Environment Variables

Create a .env file in the root directory based on .env.example:

```bash
cp .env.example .env
```

### Run the Development Server

```bash
npm run dev
```

The server will start (default: http://localhost:3000)

### Test the API 

A convenience script is provided to test the key endpoints automatically.

```bash
bash api-test.sh

```

### Tech Stack

- Node.js + Express — Web framework

- Prisma ORM — Database access

- PostgreSQL / MySQL — Database (depending on your .env)

- JWT — Authentication

- Docker Compose — local setup