import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { AuthGuard, GuestGuard, RoleGuard, getDashboardPath } from '../components/guards/RouteGuards';
import { UserRole } from '../types';

// Auth pages
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';

// Dashboard pages
import AdminDashboard from '../features/dashboard/pages/AdminDashboard';
import TraineeDashboard from '../features/dashboard/pages/TraineeDashboard';
import TrainerDashboard from '../features/dashboard/pages/TrainerDashboard';
import TraineeHomePage from '../features/dashboard/pages/TraineeHomePage';

// Feature pages
import WorkshopListPage from '../features/workshops/pages/WorkshopListPage';
import WorkshopDetailPage from '../features/workshops/pages/WorkshopDetailPage';
import WorkshopBuilderPage from '../features/workshops/pages/WorkshopBuilderPage';
import BookmarkedWorkshopsPage from '../features/workshops/pages/BookmarkedWorkshopsPage';
import BookingListPage from '../features/bookings/pages/BookingListPage';
import BookingDetailPage from '../features/bookings/pages/BookingDetailPage';
import NotificationsPage from '../features/notifications/pages/NotificationsPage';
import SpecializationsPage from '../features/specializations/pages/SpecializationsPage';
import UsersPage from '../features/users/pages/UsersPage';
import ManagersPage from '../features/managers/pages/ManagersPage';
import TrainersPage from '../features/trainers/pages/TrainersPage';

import StatisticsPage from '../features/statistics/pages/StatisticsPage';
import ProfilePage from '../features/profile/pages/ProfilePage';
import ReviewsPage from '../features/reviews/pages/ReviewsPage';
import CourseListPage from '../features/courses/pages/CourseListPage';
import CourseDetailPage from '../features/courses/pages/CourseDetailPage';
import CoursePlayerPage from '../features/courses/pages/CoursePlayerPage';
import CourseManagePage from '../features/courses/pages/CourseManagePage';
import CourseBuilderPage from '../features/courses/pages/CourseBuilderPage';
import EnrollmentRequestsPage from '../features/requirements/pages/EnrollmentRequestsPage';
import { useAuthStore } from '../store/authStore';

const InitialRoute = () => {
          const { isAuthenticated, user } = useAuthStore();
          if (isAuthenticated && user) {
                    return <Navigate to={getDashboardPath(user.role)} replace />;
          }
          return <TraineeHomePage />;
};

const router = createBrowserRouter([
          // --- Public / Guest routes ---
          { path: '/login', element: <GuestGuard><LoginPage /></GuestGuard> },
          { path: '/register', element: <GuestGuard><RegisterPage /></GuestGuard> },

          // --- Protected & Public routes within AppLayout ---
          {
                    path: '/',
                    element: <AppLayout />,
                    children: [
                              { index: true, element: <InitialRoute /> },

                              // Dashboards
                              { path: 'home', element: <AuthGuard><RoleGuard roles={[UserRole.TRAINEE, UserRole.TRAINER, UserRole.MANAGER]}><TraineeHomePage /></RoleGuard></AuthGuard> },
                              { path: 'dashboard', element: <AuthGuard><TraineeDashboard /></AuthGuard> },
                              { path: 'dashboard/admin', element: <AuthGuard><RoleGuard roles={[UserRole.SUPER_ADMIN]}><AdminDashboard /></RoleGuard></AuthGuard> },
                              { path: 'dashboard/manager', element: <AuthGuard><RoleGuard roles={[UserRole.MANAGER]}><AdminDashboard /></RoleGuard></AuthGuard> },
                              { path: 'dashboard/trainer', element: <AuthGuard><RoleGuard roles={[UserRole.TRAINER]}><TrainerDashboard /></RoleGuard></AuthGuard> },
                              { path: 'dashboard/trainee', element: <AuthGuard><RoleGuard roles={[UserRole.TRAINEE]}><TraineeDashboard /></RoleGuard></AuthGuard> },

                              // Workshops (Public and Protected)
                              { path: 'workshops', element: <WorkshopListPage /> },
                              { path: 'workshops/:id/edit', element: <AuthGuard><RoleGuard roles={[UserRole.TRAINER, UserRole.SUPER_ADMIN, UserRole.MANAGER]}><WorkshopBuilderPage /></RoleGuard></AuthGuard> },
                              { path: 'workshops/:id', element: <WorkshopDetailPage /> },
                              { path: 'bookmarks', element: <AuthGuard><RoleGuard roles={[UserRole.TRAINEE]}><BookmarkedWorkshopsPage /></RoleGuard></AuthGuard> },

                              // Courses (Public and Protected)
                              { path: 'courses', element: <CourseListPage /> },
                              { path: 'courses/manage', element: <AuthGuard><RoleGuard roles={[UserRole.TRAINER, UserRole.SUPER_ADMIN, UserRole.MANAGER]}><CourseManagePage /></RoleGuard></AuthGuard> },
                              { path: 'courses/:id/edit', element: <AuthGuard><RoleGuard roles={[UserRole.TRAINER, UserRole.SUPER_ADMIN, UserRole.MANAGER]}><CourseBuilderPage /></RoleGuard></AuthGuard> },
                              { path: 'courses/:id', element: <CourseDetailPage /> },
                              { path: 'courses/:id/learn', element: <AuthGuard><CoursePlayerPage /></AuthGuard> },

                              // Bookings
                              { path: 'bookings', element: <AuthGuard><RoleGuard roles={[UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.TRAINEE]}><BookingListPage /></RoleGuard></AuthGuard> },
                              { path: 'bookings/:id', element: <AuthGuard><RoleGuard roles={[UserRole.SUPER_ADMIN, UserRole.MANAGER, UserRole.TRAINEE]}><BookingDetailPage /></RoleGuard></AuthGuard> },

                              // Users (SuperAdmin)
                              { path: 'users', element: <AuthGuard><RoleGuard roles={[UserRole.SUPER_ADMIN]}><UsersPage /></RoleGuard></AuthGuard> },

                              // Managers (SuperAdmin)
                              { path: 'managers', element: <AuthGuard><RoleGuard roles={[UserRole.SUPER_ADMIN]}><ManagersPage /></RoleGuard></AuthGuard> },

                              // Trainers (SuperAdmin / Manager)
                              { path: 'trainers', element: <AuthGuard><RoleGuard roles={[UserRole.SUPER_ADMIN, UserRole.MANAGER]}><TrainersPage /></RoleGuard></AuthGuard> },

                              // Specializations (SuperAdmin)
                              { path: 'specializations', element: <AuthGuard><RoleGuard roles={[UserRole.SUPER_ADMIN]}><SpecializationsPage /></RoleGuard></AuthGuard> },

                              // Enrollment Requests (SuperAdmin / Manager)
                              { path: 'enrollment-requests', element: <AuthGuard><RoleGuard roles={[UserRole.SUPER_ADMIN, UserRole.MANAGER]}><EnrollmentRequestsPage /></RoleGuard></AuthGuard> },

                              // Notifications
                              { path: 'notifications', element: <AuthGuard><NotificationsPage /></AuthGuard> },

                              // Reviews
                              { path: 'reviews', element: <AuthGuard><ReviewsPage /></AuthGuard> },

                              // Statistics (SuperAdmin / Manager)
                              { path: 'statistics', element: <AuthGuard><RoleGuard roles={[UserRole.SUPER_ADMIN, UserRole.MANAGER]}><StatisticsPage /></RoleGuard></AuthGuard> },

                              // Profile
                              { path: 'profile', element: <AuthGuard><ProfilePage /></AuthGuard> },

                              // Unauthorized
                              { path: 'unauthorized', element: <div style={{ padding: 24, textAlign: 'center' }}><h1>⛔ Access Denied</h1></div> },
                    ],
          },

          // Catch-all
          { path: '*', element: <Navigate to="/" replace /> },
]);

export default router;
