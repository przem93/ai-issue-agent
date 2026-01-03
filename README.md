# AI Issue Agent

AI agent that analyzes project descriptions and automatically creates actionable tasks in issue trackers.

## Description

AI Issue Agent is a NestJS-based application that leverages OpenAI's API to analyze project descriptions and generate structured, actionable implementation steps. The application provides a REST API for creating project steps from natural language descriptions, making it easier to break down complex projects into manageable tasks.

## Features

- 🤖 **AI-Powered Step Generation**: Uses OpenAI to analyze project descriptions and create implementation steps
- 🎨 **React UI**: Modern web interface for interacting with the API
- 🚀 **NestJS Framework**: Built with modern NestJS architecture
- ⚡ **Bun Runtime**: Fast TypeScript execution with Bun
- 🐳 **Docker Support**: Full Docker and Docker Compose configuration
- 🔥 **Hot Reload**: Development mode with automatic code reloading
- 📝 **TypeScript**: Fully typed with TypeScript
- 🎨 **Code Formatting**: Prettier with automatic import sorting

## Prerequisites

- **Docker** and **Docker Compose** (for containerized deployment)
- **Bun** or **Node.js** (for local development)
- **OpenAI API Key** (get one from [OpenAI](https://platform.openai.com/api-keys))

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/przem93/ai-issue-agent.git
cd ai-issue-agent
```

### 2. Set up environment variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:

```env
OPENAI_API_KEY=sk-your-actual-api-key-here
PORT=3000
NODE_ENV=development
```

### 3. Install dependencies

Backend:
```bash
cd backend
bun install
# or
npm install
cd ..
```

Frontend:
```bash
cd frontend
npm install
cd ..
```

### 4. Run the application

**Option 1: Using Docker Compose (Recommended)**

```bash
npm run run
# or
./run.sh run
```

This will:
- Build the Docker images (if needed)
- Start both backend and frontend with hot reload
- Backend available at `http://localhost:3000`
- Frontend available at `http://localhost:5173`

**Option 2: Local development (without Docker)**

Backend:
```bash
cd backend
npm install
npm run dev
# or
bun install
bun run dev
```

Frontend (in separate terminal):
```bash
cd frontend
npm install
npm run dev
```

## Usage

### Web UI

The easiest way to use the application is through the web UI:

1. Start the application with Docker Compose: `npm run run`
2. Open your browser and navigate to `http://localhost:5173`
3. Enter your project description in the text area
4. Click "Generate Steps" to get AI-generated implementation steps

### API Endpoints

#### Health Check

```bash
GET http://localhost:3000/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### Create Steps from Project Description

```bash
POST http://localhost:3000/api/steps
Content-Type: application/json

{
  "projectDescription": "Build a todo app with user authentication and task management"
}
```

Response:
```json
"1. Set up project structure\n2. Implement user authentication\n3. Create task management system\n..."
```

#### Root Endpoint

```bash
GET http://localhost:3000/
```

Response:
```json
{
  "message": "Hello from AI Issue Agent!"
}
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run run` | Run with Docker Compose (dev mode with hot reload) |
| `npm run dev` | Run locally without Docker (with watch mode) |
| `npm run prod` | Run in production mode with Docker Compose |
| `npm run build` | Build Docker image |
| `npm run deploy` | Deploy with Docker Compose (background) |
| `npm run status` | Show Docker Compose services status |
| `npm run logs` | Show application logs |
| `npm run stop` | Stop Docker Compose services |
| `npm run down` | Stop and remove Docker Compose services |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |

## Project Structure

```
ai-issue-agent/
├── backend/              # Backend application
│   ├── src/             # Backend source code
│   │   ├── features/   # Feature modules
│   │   │   ├── app/    # Main application module
│   │   │   ├── completion/ # OpenAI completion service
│   │   │   └── steps/  # Steps generation service
│   │   ├── connectors/ # External service connectors
│   │   │   └── complete/ # OpenAI connector
│   │   └── index.ts    # Application entry point
│   ├── Dockerfile       # Production Dockerfile
│   ├── Dockerfile.dev   # Development Dockerfile
│   ├── package.json    # Backend dependencies
│   └── tsconfig.json   # TypeScript configuration
├── frontend/            # React frontend application
│   ├── src/            # React source code
│   ├── public/         # Static assets
│   ├── Dockerfile      # Production Dockerfile
│   ├── Dockerfile.dev  # Development Dockerfile
│   └── package.json    # Frontend dependencies
├── docker-compose.yml    # Production Docker Compose config
├── docker-compose.dev.yml # Development Docker Compose config
└── run.sh               # Helper script for running the app
```

## Development

### Code Formatting

The project uses Prettier with automatic import sorting. Import groups are:
1. External packages (`@nestjs/*`, `openai`, etc.)
2. Aliases (`@features/*`, `@connectors/*`)
3. Relative imports (`./`, `../`)

Format on save is enabled in VS Code. To format manually:

```bash
npm run format
```

### Path Aliases

The backend uses TypeScript path aliases:
- `@features/*` → `src/features/*`
- `@connectors/*` → `src/connectors/*`

Example:
```typescript
import { AppModule } from '@features/app/app.module';
import { OpenAIConnector } from '@connectors/complete/OpenAIConnector';
```

### Hot Reload

When running with `npm run run`, changes to source files automatically reload the application thanks to Bun's watch mode and Docker volume mounts.

## Docker

### Development Mode

```bash
npm run run
```

Uses `docker-compose.dev.yml` with:
- Hot reload enabled
- Source code mounted as volume
- Development environment

### Production Mode

```bash
npm run prod
```

Uses `docker-compose.yml` with:
- Optimized production build
- No hot reload
- Production environment

## Environment Variables

### Backend

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key (required) | - |
| `PORT` | Backend application port | `3000` |
| `NODE_ENV` | Environment mode | `development` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |

### Frontend

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:3000` |

## Troubleshooting

### Docker issues

If you encounter Docker-related issues:

```bash
# Check if Docker is running
docker ps

# Rebuild containers
docker-compose down
docker-compose up --build
```

### OpenAI API errors

Make sure your `OPENAI_API_KEY` is set correctly in the `.env` file:

```bash
# Verify the key is loaded
cat .env | grep OPENAI_API_KEY
```

### Port already in use

If port 3000 is already in use, change it in `.env`:

```env
PORT=3001
```

## License

MIT

## Author

Przemysław Ratajczak (przem93)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

