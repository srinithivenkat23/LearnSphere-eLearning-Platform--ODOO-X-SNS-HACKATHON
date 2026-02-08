import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AuthLanding from "./pages/AuthLanding";
import InstructorLayout from "./components/layout/InstructorLayout";
import InstructorDashboard from "./pages/instructor/Dashboard";
import InstructorCourses from "./pages/instructor/CourseManagement";
import CourseEditor from "./pages/instructor/CourseEditor";
import QuizBuilder from "./pages/instructor/QuizBuilder";
import InstructorReporting from "./pages/instructor/Reporting";
import InstructorSettings from "./pages/instructor/Settings";
import LearnerLayout from "./components/layout/LearnerLayout";
import CourseCatalog from "./pages/learner/CourseCatalog";
import MyCourses from "./pages/learner/MyCourses";
import CourseDetail from "./pages/learner/CourseDetail";
import LessonPlayer from "./pages/learner/LessonPlayer";
import Profile from "./pages/learner/Profile";
import Leaderboard from "./pages/learner/Leaderboard";
import OnlineDegrees from "./pages/OnlineDegrees";
import CareerPathways from "./pages/CareerPathways";
import PlaceholderPage from "./pages/PlaceholderPage";

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, userData, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  if (allowedRoles && !allowedRoles.includes(userData?.role)) {
    return <Navigate to="/" />; // Unauthorized
  }

  return children;
};

const SettingsWrapper = () => {
  const { userData } = useAuth();
  const title = userData?.role === 'admin' ? 'Admin Settings' : 'Instructor Settings';
  return <PlaceholderPage title={title} message="Manage your profile, payout methods, and notification preferences." />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<AuthLanding />} />
          <Route path="/signup" element={<AuthLanding />} />

          {/* Admin Auth */}
          <Route path="/admin/login" element={<Login title="Admin Portal" />} />
          <Route path="/admin/signup" element={<Signup defaultRole="admin" secretCodeRequired={true} title="Create Admin Account" />} />

          {/* Instructor Auth */}
          <Route path="/instructor/login" element={<Login title="Instructor Login" />} />
          <Route path="/instructor/signup" element={<Signup defaultRole="instructor" title="Become an Instructor" />} />

          {/* Student Auth (Explicit) */}
          <Route path="/learner/login" element={<Login title="Student Login" />} />
          <Route path="/learner/signup" element={<Signup defaultRole="learner" title="Student Signup" />} />

          {/* Instructor Routes */}
          <Route
            path="/instructor"
            element={
              <ProtectedRoute allowedRoles={['instructor', 'admin']}>
                <InstructorLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<InstructorDashboard />} />
            <Route path="courses" element={<InstructorCourses />} />
            <Route path="courses/:courseId" element={<CourseEditor />} />
            <Route path="courses/:courseId/quiz/:quizId" element={<QuizBuilder />} />
            <Route path="reports" element={<InstructorReporting />} />
            <Route path="settings" element={<InstructorSettings />} />
          </Route>

          {/* Public & Learner Routes */}
          <Route element={<LearnerLayout />}>
            <Route path="/" element={<CourseCatalog />} />
            <Route
              path="/my-courses"
              element={
                <ProtectedRoute allowedRoles={['learner', 'instructor', 'admin']}>
                  <MyCourses />
                </ProtectedRoute>
              }
            />
            <Route path="courses/:courseId" element={<CourseDetail />} />

            {/* Placeholder Routes */}
            <Route path="/degrees" element={<PlaceholderPage title="Online Degrees" message="Explore recognized degrees from top universities. Coming soon!" />} />
            <Route path="/careers" element={<PlaceholderPage title="Career Pathways" message="Find the perfect career path for your skills and interests." />} />
            <Route path="/profile" element={
              <ProtectedRoute allowedRoles={['learner', 'instructor', 'admin']}>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/degrees" element={<OnlineDegrees />} />
            <Route path="/careers" element={<CareerPathways />} />
            <Route path="/enterprise" element={<PlaceholderPage title="For Enterprise" message="Upskill your team with our world-class business solutions." />} />
          </Route>

          <Route
            path="/courses/:courseId/learn/:lessonId?"
            element={
              <ProtectedRoute allowedRoles={['learner', 'instructor', 'admin']}>
                <LessonPlayer />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<PlaceholderPage title="Page Not Found" message="The page you are looking for does not exist." />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
