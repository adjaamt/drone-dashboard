# Drone Surveillance Control Panel

A professional real-time drone surveillance dashboard built with React, TypeScript, and Tailwind CSS. Features satellite map view, circular command dial, and real-time telemetry monitoring.

![Dashboard Preview](docs/preview.png)

## ✨ Features

- **Satellite Map** - ESRI World Imagery with drone tracking, flight path, and compass
- **Real-time Telemetry** - Speed, altitude, battery, flight mode, armed status
- **Circular Command Dial** - Intuitive gamepad-style controls (ARM, DISARM, TAKEOFF, LAND, RTL, LOITER)
- **Alert System** - Color-coded alerts (Critical, Warning, Info)
- **Professional Dark Theme** - Charcoal background with orange accents
- **Mock Data Mode** - Test without a real drone connection
- **Dockerized** - Production-ready container image

## 🚀 Quick Start

### Development

```bash
# Clone the repository
git clone <repo-url>
cd drone-dashboard

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

### Docker (Production)

```bash
# Build Docker image
docker build -t drone-dashboard:latest .

# Run container
docker run -p 3000:80 drone-dashboard:latest

# Open http://localhost:3000
```

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS v4 |
| Map | Leaflet + ESRI Satellite Tiles |
| Animations | Framer Motion |
| Icons | Lucide React |
| UI Components | shadcn/ui (Radix) |
| Container | Docker (nginx:alpine) |

## 📁 Project Structure

```
src/
├── components/
│   ├── FullScreenDashboard.tsx   # Main layout
│   ├── EnhancedMap.tsx           # Satellite map with overlays
│   ├── ProfessionalTelemetry.tsx # Telemetry cards grid
│   ├── CircularCommandDial.tsx   # Command controls
│   ├── CompactAlerts.tsx         # Alert list
│   ├── DashboardHeader.tsx       # Top navigation
│   └── ui/tooltip.tsx            # Tooltip component
├── hooks/
│   └── useWebSocket.ts           # WebSocket state management
├── services/
│   ├── mockWebSocket.ts          # Mock data generator
│   ├── websocket.ts              # Real WebSocket client
│   └── api.ts                    # REST API client
├── types/
│   └── telemetry.ts              # TypeScript interfaces
├── utils/
│   └── formatters.ts             # Data formatting utilities
└── lib/
    └── utils.ts                  # Class utilities (cn)
```

## 🎨 UI Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  🔶 Drone Surveillance Control Panel │ Mode │ Armed │ Battery  │
├─────────────────────────────────┬───────────────────────────────┤
│                                 │  [Speed] [Alt] [Time]         │
│                                 │  [Batt]  [Mode] [Status]      │
│        SATELLITE MAP            ├───────────────┬───────────────┤
│     (ESRI World Imagery)        │   COMMAND     │    ALERTS     │
│     + Drone icon                │    DIAL       │    PANEL      │
│     + Flight path               │   ↑↓←→⏻     │               │
│     + Compass                   │               │               │
└─────────────────────────────────┴───────────────┴───────────────┘
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file:

```env
# Use mock data (true for development)
VITE_USE_MOCK=true

# WebSocket URL (when USE_MOCK=false)
VITE_WS_URL=ws://localhost:8080

# API URL (for REST endpoints)
VITE_API_URL=http://localhost:8080/api
```

## 🐳 Docker

### Build

```bash
docker build -t drone-dashboard:latest .
```

**Image Size**: ~25MB (multi-stage build)

### Run

```bash
# Run in foreground
docker run -p 3000:80 drone-dashboard:latest

# Run in background
docker run -d -p 3000:80 --name drone-dashboard drone-dashboard:latest

# View logs
docker logs drone-dashboard

# Stop container
docker stop drone-dashboard
```

### Health Check

```bash
curl http://localhost:3000/health
# Returns: OK
```

## 📊 Data Types

### Telemetry
```typescript
interface Telemetry {
  droneId: string;
  timestamp: number;
  position: { lat: number; lon: number; alt: number };
  velocity: { vx: number; vy: number; vz: number };
  attitude: { roll: number; pitch: number; yaw: number };
  battery: number;
  flightMode: string;
  armed: boolean;
  groundSpeed?: number;
}
```

### Commands
- `ARM` - Arm drone motors
- `DISARM` - Disarm drone motors
- `TAKEOFF` - Take off to specified altitude
- `LAND` - Land at current position
- `RTL` - Return to launch point
- `LOITER` - Hold current position

## 📚 Documentation

- **[Complete Project Journey](docs/COMPLETE_PROJECT_JOURNEY.md)** - ⭐ **Meticulous step-by-step guide of everything we built**
- **[Project Structure](docs/PROJECT_STRUCTURE.md)** - Complete file structure explanation
- **[Phase 1: Dockerization](docs/PHASE1_DOCKERIZATION.md)** - Docker setup guide
- **[Phase 2: CI/CD Pipeline](docs/PHASE2_CI_CD.md)** - CI/CD to Kubernetes guide

## 🔜 Roadmap

- [x] Frontend dashboard
- [x] Mock data simulation
- [x] Dockerize application ✅
- [x] CI/CD pipeline (GitHub Actions) ✅
- [x] Kubernetes manifests ✅
- [ ] AWS ECR & EKS setup
- [ ] Real backend integration (MAVLink)

## 📦 Scripts

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🏗️ Deployment Phases

### ✅ Phase 1: Dockerization (Complete)
- Multi-stage Dockerfile
- nginx production server
- Optimized image size (~25MB)
- Health check endpoints

### ✅ Phase 2: CI/CD Pipeline (Complete)
- GitHub Actions workflow
- Automated testing (lint, type check)
- Docker image build & push to ECR
- Kubernetes manifest updates
- Rolling updates with zero downtime
- Automatic rollback on failure

### 📋 Phase 3: AWS Infrastructure Setup
- ECR repository creation
- EKS cluster setup
- IAM roles & policies
- ALB Ingress Controller
- SSL certificates (ACM)

## 📄 License

MIT
