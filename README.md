# Drone Surveillance Control Panel

A professional real-time drone surveillance dashboard built with React, TypeScript, and Tailwind CSS. Features satellite map view, circular command dial, and real-time telemetry monitoring integrated with AWS DynamoDB.

## ✨ Features

- **Satellite Map** - ESRI World Imagery with drone tracking, flight path, and compass
- **Real-time Telemetry** - Speed, altitude, battery, flight mode, armed status
- **AWS DynamoDB Integration** - Polls DynamoDB every 2 seconds for latest telemetry data
- **Circular Command Dial** - Intuitive gamepad-style controls (ARM, DISARM, TAKEOFF, LAND, RTL, LOITER)
- **Alert System** - Color-coded alerts (Critical, Warning, Info)
- **Professional Dark Theme** - Charcoal background with orange accents
- **Cloud-Native** - Deployed on AWS EKS with automated CI/CD pipeline
- **Dockerized** - Production-ready container image (~25MB)

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
| Cloud Database | AWS DynamoDB |
| Cloud Infrastructure | AWS EKS, ECR, EC2, Load Balancer |
| CI/CD | GitHub Actions |

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
│   ├── useDynamoDB.ts            # DynamoDB polling hook (current)
│   └── useWebSocket.ts           # WebSocket state management (legacy)
├── services/
│   ├── dynamodb.ts               # DynamoDB client & data transformation
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

Create a `.env` file for local development (this file is gitignored):

```env
# AWS Configuration
VITE_AWS_REGION=us-east-1
VITE_DYNAMODB_TABLE=drone-telemetry

# AWS Credentials (for local development only)
# In production (EKS), credentials come from IAM role automatically
VITE_AWS_ACCESS_KEY_ID=your-access-key-id
VITE_AWS_SECRET_ACCESS_KEY=your-secret-access-key

# Legacy WebSocket (optional)
VITE_USE_MOCK=true
VITE_WS_URL=ws://localhost:8080
VITE_API_URL=http://localhost:8080/api
```

**Important**: The `.env` file is gitignored and will NOT be committed to GitHub. For production (EKS), credentials are handled via IAM roles attached to the node group.

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

## 🔜 Roadmap

- [x] Frontend dashboard
- [x] Mock data simulation
- [x] Dockerize application 
- [x] CI/CD pipeline (GitHub Actions) 
- [x] Kubernetes manifests 
- [x] AWS ECR setup 
- [x] AWS EKS setup
- [x] DynamoDB integration


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
- GitHub Actions workflow ✅
- Automated testing (lint, type check) ✅
- Docker image build & push to ECR ✅
- Kubernetes manifest updates ✅
- Rolling updates with zero downtime ✅
- Automatic rollback on failure ✅

### ✅ Phase 3: AWS Infrastructure (Complete)
- ECR repository ✅
- EKS cluster (2x t3.medium nodes) ✅
- IAM roles & policies ✅
- Network Load Balancer ✅
- DynamoDB table setup ✅

### ✅ Phase 4: Cloud Integration (Complete)
- DynamoDB integration ✅
- Frontend polling (2s interval) ✅
- Data transformation from MAVLink message types (battery, altitude, state) ✅
- Multi-message type handling (combines latest of each type) ✅
- IAM permissions for EKS nodes ✅

## 📡 Data Flow

```
PX4 Simulator (Local)
    ↓ UDP Port 14550
Node.js Bridge (Local)
    ↓ Converts MAVLink → JSON
    ↓ AWS SDK PutItem (battery, altitude, state messages)
DynamoDB (AWS Cloud)
    ↓ Poll every 2 seconds
    ↓ Fetches latest of each message type
React Frontend (EKS)
    ↓ Combines messages into Telemetry object
    ↓ Network Load Balancer
End Users (Web Browser)
```

### DynamoDB Message Types

The bridge sends three types of messages to DynamoDB:
- **battery**: `{ type: "battery", remaining: 100, voltage: 16.2, load: 15.6 }`
- **altitude**: `{ type: "altitude", relative: "1.25", amsl: "0.45" }`
- **state**: `{ type: "state", armed: true, mode: 0 }`

The frontend fetches the latest of each type and combines them into a single telemetry object.

## ☁️ AWS Services Used

- **EKS** - Kubernetes cluster for container orchestration
- **ECR** - Container registry for Docker images
- **DynamoDB** - NoSQL database for telemetry storage
- **EC2** - Compute instances (t3.medium) for worker nodes
- **Network Load Balancer** - Public access to the application
- **IAM** - Access management and permissions

## 📄 License

MIT

