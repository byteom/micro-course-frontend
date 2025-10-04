# MicroCourses Frontend

A modern React frontend for the MicroCourses Learning Management System.

## Features

- **Authentication**: Login, register, and logout with cookie-based sessions
- **Course Browsing**: Search, filter, and browse courses by category
- **Course Details**: View detailed course information and enroll
- **User Dashboard**: Role-based dashboards for learners, creators, and admins
- **Profile Management**: Update profile information and change passwords
- **Responsive Design**: Mobile-first design with Tailwind CSS

## Tech Stack

- **React 19** - Frontend framework
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **React Hot Toast** - Toast notifications
- **Lucide React** - Icon library
- **js-cookie** - Cookie management

## Color Scheme

- **Primary Blue**: `#2563eb` (blue-600)
- **Success Green**: `#16a34a` (green-600)
- **Background**: `#f9fafb` (gray-50)
- **Text**: `#111827` (gray-900)
- **Secondary Text**: `#6b7280` (gray-500)

## Project Structure

```
src/
├── components/
│   └── Layout/
│       ├── Header.jsx
│       ├── Footer.jsx
│       └── Layout.jsx
├── contexts/
│   └── AuthContext.jsx
├── pages/
│   ├── Auth/
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── Courses/
│   │   ├── CourseList.jsx
│   │   └── CourseDetail.jsx
│   ├── Learner/
│   │   └── Dashboard.jsx
│   ├── Home.jsx
│   └── Profile.jsx
├── services/
│   └── api.js
├── App.jsx
├── main.jsx
└── index.css
```

## User Roles

### Learner
- Browse and search courses
- Enroll in courses
- Track learning progress
- View personalized dashboard
- Earn certificates

### Creator
- Create and manage courses
- Upload video lessons
- View course analytics
- Manage course content

### Admin
- Manage all users and courses
- Review creator applications
- Approve/reject course submissions
- View system statistics

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## API Integration

The frontend communicates with the backend API running on `http://localhost:5000`. All API calls are handled through the `services/api.js` file with automatic token management via cookies.

## Authentication

- Uses HTTP-only cookies for secure token storage
- Automatic token refresh and logout on expiration
- Role-based route protection
- Persistent login state across browser sessions

## Responsive Design

The application is fully responsive and works on:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)