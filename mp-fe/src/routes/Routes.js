// src/routes/Routes.js
import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { Provider } from "react-redux";
import CssBaseline from "@mui/material/CssBaseline";

import store from "../store/store";
import theme from "../theme";
import ProtectedRoute from "../components/ProtectedRoute";
import PublicRoute from "../components/PublicRoute";
import ErrorBoundary from "../shared/components/ErrorBoundary";
import AchievementNotifications from "../features/achievements/components/AchievementNotifications";
import { PageLoadingFallback } from "../shared/components/LoadingFallback";

// Lazy load pages for better performance and code splitting
const LandingPage = lazy(() =>
  import("../pages/LandingPage").then((module) => ({ default: module.default }))
);
const Dashboard = lazy(() =>
  import("../pages/Dashboard").then((module) => ({ default: module.default }))
);
const AdminDashboard = lazy(() =>
  import("../pages/AdminDashboard/AdminDashboardSimplified").then((module) => ({
    default: module.default,
  }))
);
const TeacherDashboard = lazy(() =>
  import("../pages/TeacherDashboard").then((module) => ({
    default: module.default,
  }))
);
const CourseCreatePage = lazy(() =>
  import("../pages/CourseCreatePage").then((module) => ({
    default: module.default,
  }))
);
const CatalogPage = lazy(() =>
  import("../pages/CatalogPage").then((module) => ({ default: module.default }))
);
const TutorialPage = lazy(() =>
  import("../components/TutorialPage").then((module) => ({
    default: module.default,
  }))
);
const CourseDetailPage = lazy(() =>
  import("../pages/CourseDetailPage").then((module) => ({
    default: module.default,
  }))
);
const ProfilePage = lazy(() =>
  import("../pages/ProfilePage").then((module) => ({ default: module.default }))
);

// Authentication pages (can be grouped in same chunk)
const LoginPage = lazy(() =>
  import("../pages/LoginPage").then((module) => ({ default: module.default }))
);
const SignupPage = lazy(() =>
  import("../pages/SignupPage").then((module) => ({ default: module.default }))
);
const ForgotPasswordPage = lazy(() =>
  import("../pages/ForgotPasswordPage").then((module) => ({
    default: module.default,
  }))
);
const ResetPasswordPage = lazy(() =>
  import("../pages/ResetPasswordPage").then((module) => ({
    default: module.default,
  }))
);
const VerifyEmailPage = lazy(() =>
  import("../pages/VerifyEmailPage").then((module) => ({
    default: module.default,
  }))
);

// Admin and content creation components
const AdminApproval = lazy(() =>
  import("../components/AdminApproval").then((module) => ({
    default: module.default,
  }))
);
const TutorialCreator = lazy(() =>
  import("../components/TutorialCreator").then((m) => ({ default: m.default }))
);

const AppRoutes = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ErrorBoundary
          title="Application Error"
          description="Something went wrong with the music platform. Please try refreshing the page."
        >
          <Router>
            <Suspense fallback={<PageLoadingFallback />}>
              <Routes>
                <Route element={<PublicRoute />}>
                  <Route
                    path="/forgot-password"
                    element={<ForgotPasswordPage />}
                  />
                  <Route
                    path="/reset-password"
                    element={<ResetPasswordPage />}
                  />
                  <Route path="/verify-email" element={<VerifyEmailPage />} />
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                </Route>
                <Route path="/courses" element={<CatalogPage />} />
                <Route path="/courses/:id" element={<CourseDetailPage />} />
                <Route path="/tutorial/:id" element={<TutorialPage />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                </Route>
                <Route
                  element={<ProtectedRoute roles={["teacher", "admin"]} />}
                >
                  <Route
                    path="/teacher-dashboard"
                    element={<TeacherDashboard />}
                  />
                  <Route
                    path="/teacher/create-course"
                    element={<CourseCreatePage />}
                  />

                  <Route
                    path="/create-tutorial"
                    element={<TutorialCreator />}
                  />
                </Route>
                <Route element={<ProtectedRoute roles={["admin"]} />}>
                  <Route path="/admin-dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/approval" element={<AdminApproval />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
            <AchievementNotifications position="top-right" />
          </Router>
        </ErrorBoundary>
      </ThemeProvider>
    </Provider>
  );
};

export default AppRoutes;
