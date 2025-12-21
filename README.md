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
- **OpenSreetMaps**: Leaflet with heat mapping
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

#### 🔐 User Authentication
- **JWT Token-Based Authentication**: Secure token-based authentication system using djangorestframework-simplejwt
- **User Registration**: Simple and secure signup process with email verification
- **Role-Based Access Control**: Different user types (Citizens, Admins, Emergency Personnel)
- **Session Management**: Automatic token refresh and expiration handling
- **Password Security**: Industry-standard password hashing and validation

#### 📍 Incident Reporting
- **Real-Time Location Tracking**: Automatically capture GPS coordinates of incidents
- **Detailed Incident Forms**: Comprehensive incident reporting with multiple fields
- **Photo & Video Attachments**: Support for multi-file uploads with size optimization
- **Incident Categorization**: Predefined categories (Pothole, Water Issue, Broken Infrastructure, etc.)
- **Status Tracking**: Real-time tracking of incident status (Reported, In-Progress, Resolved)
- **Priority Scoring**: AI-based automatic priority assignment based on severity and impact

#### 📸 Media Management
- **Photo Upload & Storage**: Secure storage of incident photos in organized folders
- **Video Upload & Processing**: Support for video uploads with automatic thumbnail generation
- **Image Compression**: Automatic image optimization without quality loss
- **Batch Upload**: Upload multiple files simultaneously
- **Media Gallery**: Browse and view all incident media in organized gallery view

### Advanced Features

#### 🤖 AI-Powered Chatbot
- **Google Gemini Integration**: Advanced AI chatbot powered by Google's Gemini 2.0 Flash
- **RAG (Retrieval Augmented Generation)**: Intelligent knowledge retrieval from custom knowledge bases
- **LangChain Integration**: Structured AI workflow management
- **Context-Aware Responses**: Understands incident context and provides relevant guidance
- **24/7 Availability**: Always-on support for user assistance
- **Multi-Language Support**: Responds to queries in multiple languages

#### 🔍 Computer Vision & Pothole Detection
- **OpenCV Integration**: Advanced image processing and analysis
- **Automatic Pothole Detection**: ML-based detection in uploaded photos
- **Video Analysis**: Frame-by-frame analysis of pothole videos
- **Severity Assessment**: Estimates pothole severity and required repairs
- **Coordinates Extraction**: Automatic location identification from images
- **False Positive Reduction**: Advanced filtering to minimize incorrect detections

#### 📊 Advanced Analytics & Reporting
- **Incident Statistics Dashboard**: Real-time statistics and KPIs
- **Monthly & Yearly Trends**: Historical analysis of incident patterns
- **Severity Distribution Charts**: Visual breakdown of incident severity levels
- **Type-Based Analytics**: Analysis by incident type and category
- **Resolution Time Tracking**: Monitor average time to resolve incidents
- **Performance Metrics**: Track response times and resolution rates
- **Custom Date Ranges**: Filter analytics by specific time periods

#### 🗺️ Heat Map & Geospatial Features
- **Interactive Heat Maps**: Visual representation of high-incident areas
- **Google Maps Integration**: Embedded maps for location visualization
- **Cluster Analysis**: Identify incident hotspots and patterns
- **Location-Based Filtering**: Filter incidents by geographic regions
- **Proximity Search**: Find incidents near specific locations
- **Geographic Reporting**: Regional incident analysis and trends

#### 📈 Predictive Analytics & Forecasting
- **Incident Forecasting**: AI-powered prediction of future incidents
- **Trend Analysis**: Identify seasonal patterns and recurring issues
- **Peak Hour Detection**: Analyze when incidents are most likely to occur
- **Peak Day Analysis**: Identify days with highest incident frequency
- **High-Risk Area Identification**: Predict areas likely to have future incidents
- **Data-Driven Insights**: Generate actionable recommendations

### Platform Features

#### 🔐 Security & Compliance
- **CORS Support**: Secure cross-origin requests between frontend and backend
- **JWT Token Validation**: Secure API endpoint protection
- **Data Encryption**: Sensitive data encryption in transit and at rest
- **User Authorization**: Role-based access control for different user types
- **API Rate Limiting**: Protection against abuse and DDoS attacks
- **Secure File Storage**: Protected media file storage with access controls

#### 📧 Notification System
- **Email Notifications**: Automated email alerts for incident updates
- **SMS Notifications**: Optional SMS alerts for critical incidents
- **Emergency Alerts**: Priority notifications for high-severity incidents
- **User Preferences**: Customizable notification settings
- **Template-Based Emails**: Professional formatted notification templates
- **Delivery Tracking**: Monitor notification delivery status

#### 🏥 Emergency Services Integration
- **Multi-Agency Routing**: Automatic routing to relevant agencies (Police, Fire, Hospital, Municipal Corp)
- **Emergency Contact Management**: Quick access to emergency contacts
- **Agency-Specific Dashboards**: Tailored views for different agencies
- **Real-Time Coordination**: Enable cooperation between multiple agencies
- **Incident Assignment**: Automatic or manual assignment to agencies
- **Agency Performance Metrics**: Track response times by agency

#### 📱 Responsive Design
- **Mobile-First Design**: Optimized for mobile devices and tablets
- **Cross-Platform Compatibility**: Works seamlessly on all devices
- **Progressive Web App (PWA)**: Offline support and installable app experience
- **Adaptive Layouts**: Responsive UI that adapts to screen sizes
- **Touch-Friendly Interface**: Optimized controls for touch input
- **Fast Loading**: Optimized performance for slow networks

#### 🔔 Additional Platform Features
- **Real-Time Updates**: WebSocket support for live incident updates
- **User Dashboard**: Personalized dashboard with user statistics
- **Comments & Discussions**: Community engagement on incidents
- **Admin Panel**: Comprehensive Django admin interface for system management
- **Database Management**: SQLite for development with migration support
- **Logging & Monitoring**: Detailed system logs for debugging and monitoring
- **API Documentation**: Comprehensive REST API documentation
- **Error Handling**: Graceful error handling with detailed error messages

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


## 📚 Additional Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Google Generative AI](https://ai.google.dev/)
- [LangChain Documentation](https://python.langchain.com/)

---

## 📝 License

This project is part of the Hack initiative.

## 📞 Support

For issues or questions, please refer to the project documentation or create an issue in the repository.

---

**Last Updated**: November 2025
**Project Name**: Hack - Civic Issues & Emergency Response Platform
