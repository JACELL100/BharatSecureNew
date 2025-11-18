# Hack - Civic Issues & Emergency Response Platform

A full-stack web application for reporting and managing civic issues (potholes, water issues, etc.) and emergency incidents. The platform features real-time incident tracking, AI-powered analysis, photo/video uploads, and an intelligent chatbot for assistance.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Running the Project](#running-the-project)
- [Available Endpoints](#available-endpoints)
- [Features](#features)
- [Environment Configuration](#environment-configuration)
- [Troubleshooting](#troubleshooting)

## 🎯 Project Overview

This application allows users to:
- Report civic issues (potholes, water leaks, broken infrastructure, etc.)
- Report emergency incidents with real-time location tracking
- Upload photos and videos of issues
- Chat with an AI assistant for guidance
- View incident statistics and heat maps
- Track incident resolution status

## 🛠️ Tech Stack

### Backend
- **Framework**: Django 5.1.5 with Django REST Framework
- **Database**: SQLite3 (development)
- **Authentication**: JWT (JSON Web Tokens) via djangorestframework-simplejwt
- **AI/ML**: 
  - Google Generative AI (Gemini)
  - LangChain for RAG (Retrieval Augmented Generation)
  - LangGraph for AI workflows
- **Computer Vision**: OpenCV for pothole detection
- **Utilities**: CORS support, email notifications, SMS capabilities

### Frontend
- **Framework**: React 18.3.1
- **Build Tool**: Vite
- **UI Components**: Material-UI (MUI), React Bootstrap, Tailwind CSS
- **Maps**: Leaflet with heat mapping
- **Charts**: Recharts and Chart.js
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Routing**: React Router DOM

## 📦 Prerequisites

### System Requirements
- **Python**: 3.8 or higher
- **Node.js**: 16.0 or higher
- **npm**: 7.0 or higher
- **Git**: For version control

### Required Accounts (for full functionality)
- Google AI API key (for Gemini integration)
- Email service credentials (for notifications)
- SMS service credentials (optional, for SMS alerts)

## 📁 Project Structure

```
Hack/
├── backend/                    # Django REST API
│   ├── backend/               # Main Django project settings
│   │   ├── settings.py       # Django configuration
│   │   ├── urls.py           # URL routing
│   │   ├── wsgi.py           # WSGI config
│   │   └── asgi.py           # ASGI config
│   ├── incidents/            # Incident management app
│   ├── photos/               # Photo upload and management
│   ├── chat/                 # AI chatbot functionality
│   ├── pothole_analyzer/     # Computer vision for potholes
│   ├── utils/                # Helper utilities
│   ├── knowledge_base/       # JSON knowledge bases
│   ├── media/                # Uploaded files
│   ├── manage.py             # Django CLI
│   └── requirements.txt       # Python dependencies
│
└── frontend/                   # React Vite application
    ├── src/
    │   ├── components/       # Reusable React components
    │   ├── pages/            # Page components
    │   ├── api/              # API integration
    │   ├── context/          # React Context
    │   ├── lib/              # Utilities
    │   ├── assets/           # Images, fonts, etc.
    │   ├── App.jsx           # Main App component
    │   └── main.jsx          # Entry point
    ├── public/               # Static files
    ├── package.json          # NPM dependencies
    ├── vite.config.js        # Vite configuration
    └── index.html            # HTML template
```

## 🚀 Backend Setup

### Step 1: Navigate to Backend Directory
```powershell
cd backend
```

### Step 2: Create a Virtual Environment
```powershell
# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
venv\Scripts\Activate.ps1

# If you get an execution policy error, run:
# Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Step 3: Install Dependencies
```powershell
pip install -r requirements.txt
```

### Step 4: Set Up Environment Variables
Create a `.env` file in the `backend` directory:
```
DEBUG=True
SECRET_KEY=your-secret-key-here
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
GOOGLE_API_KEY=your-google-api-key-here
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

### Step 5: Apply Database Migrations
```powershell
python manage.py migrate
```

### Step 6: Create a Superuser (Admin Account)
```powershell
python manage.py createsuperuser

# Follow the prompts to enter:
# - Username
# - Email
# - Password (twice for confirmation)
```

### Step 7: Collect Static Files (Optional for development)
```powershell
python manage.py collectstatic --noinput
```

### Step 8: Run the Development Server
```powershell
python manage.py runserver 0.0.0.0:8000
```

The backend will be available at `http://localhost:8000`

**Admin Panel**: `http://localhost:8000/admin`

## 🎨 Frontend Setup

### Step 1: Navigate to Frontend Directory
```powershell
cd frontend
```

### Step 2: Install Dependencies
```powershell
npm install
```

### Step 3: Set Up Environment Variables
Create a `.env` file in the `frontend` directory:
```
VITE_API_BASE_URL=http://localhost:8000/api
VITE_CHAT_API_URL=http://localhost:8000/api/chat
```

### Step 4: Run Development Server
```powershell
npm run dev
```

The frontend will typically run at `http://localhost:5173`

### Step 5: Build for Production
```powershell
npm run build
```

The optimized build will be created in the `dist/` directory.

## 🏃 Running the Project

### Option 1: Run Both Servers (Recommended for Development)

**Terminal 1 - Backend:**
```powershell
cd backend
venv\Scripts\Activate.ps1
python manage.py runserver 0.0.0.0:8000
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```

**Terminal 3 - Optional: Background Processing**
If you need to run background tasks (like video processing):
```powershell
cd backend
venv\Scripts\Activate.ps1
python manage.py process_tasks
```

### Option 2: Docker (If Docker Setup is Available)
```powershell
docker-compose up
```

### Option 3: Production Deployment
```powershell
# Backend
cd backend
python manage.py collectstatic --noinput
gunicorn backend.wsgi:application --bind 0.0.0.0:8000

# Frontend
cd frontend
npm run build
# Serve dist/ folder with nginx or your web server
```

## 📡 Available Endpoints

### Authentication
- `POST /api/signup/` - Create new account
- `POST /api/login/` - Login and receive JWT token

### Incidents
- `GET /api/incidents/` - List all incidents
- `POST /api/incidents/` - Create new incident
- `GET /api/incidents/{id}/` - Get incident details
- `PUT /api/incidents/{id}/` - Update incident
- `DELETE /api/incidents/{id}/` - Delete incident
- `POST /api/report-incident/` - Report new incident

### Photos
- `GET /api/photos/` - List all photos
- `POST /api/photos/` - Upload photo
- `GET /api/photos/{id}/` - Get photo details

### Chat
- `POST /api/chat/` - Send message to chatbot
- `GET /api/chat/history/` - Get chat history

### Pothole Analysis
- `POST /pothole/analyze/` - Analyze image for potholes
- `POST /pothole/detect/` - Detect potholes in video

### User
- `GET /api/user/{user_id}/` - Get user details
- `PUT /api/user/{user_id}/` - Update user profile

## ✨ Features

### Core Features
- ✅ User authentication with JWT tokens
- ✅ Incident reporting with location tracking
- ✅ Photo and video uploads
- ✅ Real-time incident updates
- ✅ Incident categorization (pothole, water issue, etc.)
- ✅ Status tracking (reported, in-progress, resolved)

### Advanced Features
- 🤖 AI-powered chatbot using Google Gemini
- 🔍 Pothole detection using computer vision
- 📊 Incident statistics and analytics
- 🗺️ Heat map visualization
- 📸 Image analysis and validation
- 🎯 Intelligent routing and priority scoring

### Platform Features
- 🔐 CORS support for cross-origin requests
- 📧 Email notifications
- 💬 SMS notifications (optional)
- 🏥 Emergency contact routing
- 📱 Responsive UI for mobile devices

## ⚙️ Environment Configuration

### Backend Settings (`backend/settings.py`)

Key configurations:
- `DEBUG = True` - Set to False in production
- `ALLOWED_HOSTS = ['*']` - Restrict in production
- `DATABASES` - SQLite by default, change for production
- `INSTALLED_APPS` - Active Django apps
- `JWT_ALGORITHM` - Token signing algorithm

### Frontend Configuration (`frontend/vite.config.js`)

Key settings:
- `BASE_URL` - Base path for deployment
- `API_BASE_URL` - Backend API endpoint
- `PORT` - Development server port (default: 5173)

## 🔧 Common Development Commands

### Backend
```powershell
# Run migrations
python manage.py migrate

# Create migrations
python manage.py makemigrations

# Access Django shell
python manage.py shell

# Run tests
python manage.py test

# Create superuser
python manage.py createsuperuser
```

### Frontend
```powershell
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## 🐛 Troubleshooting

### Backend Issues

**Issue: Virtual environment not activating**
```powershell
# Try with full path
& venv\Scripts\Activate.ps1

# If still failing, change execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Issue: Module not found errors**
```powershell
# Reinstall all dependencies
pip install --force-reinstall -r requirements.txt
```

**Issue: Database errors**
```powershell
# Reset database
python manage.py flush

# Run migrations again
python manage.py migrate
```

**Issue: Port already in use**
```powershell
# Run on different port
python manage.py runserver 0.0.0.0:8001
```

### Frontend Issues

**Issue: Dependencies not installing**
```powershell
# Clear npm cache
npm cache clean --force

# Reinstall
npm install
```

**Issue: Port 5173 already in use**
```powershell
npm run dev -- --port 3000
```

**Issue: API connection errors**
- Verify backend is running (`http://localhost:8000`)
- Check `.env` file has correct `VITE_API_BASE_URL`
- Check browser console for CORS errors

### General Issues

**Issue: CORS errors**
- Ensure `corsheaders` is in `INSTALLED_APPS`
- Verify `CORS_ALLOWED_ORIGINS` in backend settings
- Check frontend API URL matches backend host

**Issue: Authentication failing**
- Verify JWT tokens are being stored in browser
- Check `SECRET_KEY` in Django settings
- Ensure tokens haven't expired

## 📚 Additional Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Google Generative AI](https://ai.google.dev/)
- [LangChain Documentation](https://python.langchain.com/)

## 🤝 Contributing

1. Create a new branch for your feature
2. Make your changes
3. Test thoroughly
4. Create a pull request

## 📝 License

This project is part of the Hack initiative.

## 📞 Support

For issues or questions, please refer to the project documentation or create an issue in the repository.

---

**Last Updated**: November 2025
**Project Name**: Hack - Civic Issues & Emergency Response Platform
