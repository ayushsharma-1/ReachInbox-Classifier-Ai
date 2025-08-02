#!/bin/bash

echo "🚀 Starting SmartInbox - ReachInbox Email Aggregator"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${BLUE}📋 Checking prerequisites...${NC}"

if ! command_exists docker; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

if ! command_exists docker-compose; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js (v18+) first.${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All prerequisites met${NC}"

# Check if backend .env exists
if [ ! -f backend/.env ]; then
    echo -e "${YELLOW}⚠️  backend/.env file not found. Using existing configuration...${NC}"
fi

echo -e "${BLUE}📦 Installing dependencies...${NC}"

# Install backend dependencies
echo -e "${BLUE}🔧 Installing backend dependencies...${NC}"
cd backend && npm install && cd ..

# Install frontend dependencies
echo -e "${BLUE}🎨 Installing frontend dependencies...${NC}"
cd frontend && npm install && cd ..

echo -e "${GREEN}✅ Dependencies installed${NC}"

# Start services
echo -e "${BLUE}🐳 Starting Elasticsearch...${NC}"
cd backend && docker-compose up -d elasticsearch && cd ..

# Wait for Elasticsearch to be ready
echo -e "${YELLOW}⏳ Waiting for Elasticsearch to be ready...${NC}"
sleep 15

# Check Elasticsearch health
if curl -s http://localhost:9200 > /dev/null; then
    echo -e "${GREEN}✅ Elasticsearch is running${NC}"
else
    echo -e "${RED}❌ Elasticsearch failed to start${NC}"
    exit 1
fi

# Start backend in background
echo -e "${BLUE}🚀 Starting backend server...${NC}"
cd backend && node index.js &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 5

# Check if backend is running
if kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${GREEN}✅ Backend server started (PID: $BACKEND_PID)${NC}"
else
    echo -e "${RED}❌ Backend server failed to start${NC}"
    exit 1
fi

# Start frontend
echo -e "${BLUE}🎨 Starting frontend development server...${NC}"
cd frontend && npm start &
FRONTEND_PID=$!
cd ..

echo -e "${GREEN}🎉 SmartInbox is now running!${NC}"
echo -e "${BLUE}📧 Backend API: http://localhost:3000${NC}"
echo -e "${BLUE}🎨 Frontend UI: http://localhost:5000${NC}"
echo -e "${BLUE}🔍 Elasticsearch: http://localhost:9200${NC}"
echo ""
echo -e "${YELLOW}📖 Getting Started:${NC}"
echo -e "${YELLOW}1. Visit http://localhost:5000 for the web interface${NC}"
echo -e "${YELLOW}2. Start OAuth flow: http://localhost:3000/auth/gmail/initiate${NC}"
echo -e "${YELLOW}3. Connect your Gmail account and start managing emails!${NC}"
echo ""
echo -e "${BLUE}🛑 To stop all services, run: ./stop.sh${NC}"

# Create stop script
cat > stop.sh << 'EOF'
#!/bin/bash
echo "🛑 Stopping SmartInbox services..."

# Kill backend
pkill -f "node index.js"

# Kill frontend
pkill -f "npm start"

# Stop Docker services
cd backend && docker-compose down && cd ..

echo "✅ All services stopped"
EOF

chmod +x stop.sh

# Keep script running to show logs
echo -e "${BLUE}📊 Monitoring services (Ctrl+C to stop)...${NC}"
wait
