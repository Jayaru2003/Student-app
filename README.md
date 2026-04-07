# Student Info System

A full-stack student management application with:

- Backend API: ASP.NET Core 8 Web API + Entity Framework Core + SQL Server
- Frontend UI: React 18 + Vite
- Container setup: Docker + Docker Compose with Nginx reverse proxy for frontend

The app supports full CRUD operations for student records and includes API health checks.

## Features

- Create, read, update, and delete students
- Input validation on both frontend and backend
- SQL Server persistence through EF Core
- Automatic database migration on API startup
- Frontend health status indicator for backend availability
- Dockerized local run with one command

## Tech Stack

### Backend

- .NET 8
- ASP.NET Core Web API
- Entity Framework Core 8
- SQL Server provider (Microsoft.EntityFrameworkCore.SqlServer)
- Swagger (development environment)

### Frontend

- React 18
- Vite 5
- Nginx (for production container serving and API proxy)

## Project Structure

```text
.
|- docker-compose.yml
|- backend/
|  |- Dockerfile
|  |- StudentInfo.sln
|  |- src/
|     |- StudentInfo.Api/
|        |- Program.cs
|        |- Controllers/
|        |- Data/
|        |- Dtos/
|        |- Models/
|        |- Migrations/
|- frontend/
|  |- Dockerfile
|  |- nginx.conf
|  |- package.json
|  |- vite.config.js
|  |- src/
```

## API Overview

Base route:

- `/api/students`

Health route:

- `/health`

### Endpoints

1. `GET /api/students`
   - Returns all students

2. `GET /api/students/{id}`
   - Returns a single student by ID
   - `404` if not found

3. `POST /api/students`
   - Creates a new student
   - Returns `201 Created` with created student
   - Returns `400 Bad Request` if email already exists or model is invalid

4. `PUT /api/students/{id}`
   - Updates an existing student
   - Returns `204 No Content`
   - Returns `404` if not found

5. `DELETE /api/students/{id}`
   - Deletes a student
   - Returns `204 No Content`
   - Returns `404` if not found

### Student Payload

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "mobileNo": "0771234567"
}
```

Validation rules:

- `name`: required, max 100 characters
- `email`: required, valid email format, max 150 characters
- `mobileNo`: required, max 20 characters

## Prerequisites

For local non-Docker run:

- .NET SDK 8.0+
- Node.js 20+ and npm
- SQL Server (local or remote)

For Docker run:

- Docker Desktop (with Compose)

## Configuration

### Backend

Primary connection string key:

- `ConnectionStrings:DefaultConnection`

The API reads this from configuration and fails startup if missing or empty.

Options:

1. Use environment variable

```powershell
$env:ConnectionStrings__DefaultConnection="Server=...;Database=...;User Id=...;Password=...;Encrypt=True;TrustServerCertificate=False;"
```

2. Set in `backend/src/StudentInfo.Api/appsettings.json`

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=...;Database=...;User Id=...;Password=...;Encrypt=True;TrustServerCertificate=False;"
  }
}
```

### Frontend

API URL is resolved by:

- `VITE_API_URL` if provided
- otherwise `/api/students`

For local dev, Vite proxies `/api` and `/health` to `http://localhost:5000` via `frontend/vite.config.js`.

## Run Locally (Without Docker)

### 1) Run Backend API

From project root:

```powershell
cd backend/src/StudentInfo.Api
dotnet restore
dotnet run
```

Expected API URL:

- `http://localhost:5000` (when launched with current profile settings)

Health check:

- `http://localhost:5000/health`

Swagger UI (development only):

- `http://localhost:5000/swagger`

### 2) Run Frontend

From project root:

```powershell
cd frontend
npm install
npm run dev
```

Open:

- `http://localhost:3000`

## Run with Docker Compose

From project root:

```powershell
docker compose up --build
```

Services:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

How routing works in containers:

- Browser calls frontend on port 3000
- Nginx in frontend container proxies `/api` and `/health` to backend service (`http://backend:8080`)

Stop services:

```powershell
docker compose down
```

## Database Migrations

The API automatically applies EF Core migrations on startup (`Database.Migrate()`) with retry logic.

If you need to add a new migration manually:

```powershell
cd backend/src/StudentInfo.Api
dotnet ef migrations add <MigrationName>
dotnet ef database update
```

If `dotnet ef` is not installed:

```powershell
dotnet tool install --global dotnet-ef
```

## Example API Calls

Create student:

```bash
curl -X POST "http://localhost:5000/api/students" \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","mobileNo":"0771234567"}'
```

Get all students:

```bash
curl "http://localhost:5000/api/students"
```

Update student:

```bash
curl -X PUT "http://localhost:5000/api/students/1" \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Updated","email":"jane.updated@example.com","mobileNo":"0777654321"}'
```

Delete student:

```bash
curl -X DELETE "http://localhost:5000/api/students/1"
```

## Troubleshooting

1. API fails at startup with connection string error
   - Ensure `ConnectionStrings__DefaultConnection` is set and valid.

2. Frontend cannot reach backend in local mode
   - Ensure backend is running at `http://localhost:5000`.
   - Verify Vite proxy settings in `frontend/vite.config.js`.

3. Docker build fails on frontend with npm install issues
   - Ensure `package-lock.json` exists or run `npm install` once in `frontend`.

4. SQL login/SSL errors
   - Validate SQL credentials, firewall rules, and TLS options in connection string.

## Security Notes

- Do not commit real database credentials to source control.
- Use environment variables or secret management for production values.
- Restrict CORS policy in production to trusted origins only.

## Production Recommendations

- Add authentication and authorization for API endpoints.
- Replace permissive CORS with explicit allowed origins.
- Add centralized logging and monitoring.
- Add automated tests for API and UI.
- Use managed secrets (for example Azure Key Vault) for connection strings.

## License

No license file is currently defined in this repository.
