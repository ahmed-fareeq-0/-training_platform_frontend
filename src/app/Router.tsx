import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { AuthGuard, GuestGuard, RoleGuard } from '../components/guards/RouteGuards';
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

const router = createBrowserRouter([
          // --- Public / Guest routes ---
          { path: '/login', element: <GuestGuard><LoginPage /></GuestGuard> },
          { path: '/register', element: <GuestGuard><RegisterPage /></GuestGuard> },

          // --- Protected routes ---
          {
                    path: '/',
                    element: <AuthGuard><AppLayout /></AuthGuard>,
                    children: [
                              { index: true, element: <Navigate to="/dashboard" replace /> },

                              // Dashboards
                              { path: 'home', element: <RoleGuard roles={[UserRole.TRAINEE, UserRole.TRAINER, UserRole.MANAGER]}><TraineeHomePage /></RoleGuard> },
                              { path: 'dashboard', element: <TraineeDashboard /> },
                              { path: 'dashboard/admin', element: <RoleGuard roles={[UserRole.SUPER_ADMIN]}><AdminDashboard /></RoleGuard> },
                              { path: 'dashboard/manager', element: <RoleGuard roles={[UserRole.MANAGER]}><AdminDashboard /></RoleGuard> },
                              { path: 'dashboard/trainer', element: <RoleGuard roles={[UserRole.TRAINER]}><TrainerDashboard /></RoleGuard> },
                              { path: 'dashboard/trainee', element: <RoleGuard roles={[UserRole.TRAINEE]}><TraineeDashboard /></RoleGuard> },

                              // Workshops
                              { path: 'workshops', element: <WorkshopListPage /> },
                              { path: 'workshops/:id/edit', element: <RoleGuard roles={[UserRole.TRAINER, UserRole.SUPER_ADMIN, UserRole.MANAGER]}><WorkshopBuilderPage /></RoleGuard> },
                              { path: 'workshops/:id', element: <WorkshopDetailPage /> },
                              { path: 'bookmarks', element: <RoleGuard roles={[UserRole.TRAINEE]}><BookmarkedWorkshopsPage /></RoleGuard> },

                              // Courses
                              { path: 'courses', element: <CourseListPage /> },
                              { path: 'courses/manage', element: <RoleGuard roles={[UserRole.TRAINER, UserRole.SUPER_ADMIN, UserRole.MANAGER]}><CourseManagePage /></RoleGuard> },
                              { path: 'courses/:id/edit', element: <RoleGuard roles={[UserRole.TRAINER, UserRole.SUPER_ADMIN, UserRole.MANAGER]}><CourseBuilderPage /></RoleGuard> },
                              { path: 'courses/:id', element: <CourseDetailPage /> },
                              { path: 'courses/:id/learn', element: <CoursePlayerPage /> },

                              // Bookings
                              { path: 'bookings', element: <BookingListPage /> },
                              { path: 'bookings/:id', element: <BookingDetailPage /> },

                              // Users (SuperAdmin)
                              { path: 'users', element: <RoleGuard roles={[UserRole.SUPER_ADMIN]}><UsersPage /></RoleGuard> },

                              // Managers (SuperAdmin)
                              { path: 'managers', element: <RoleGuard roles={[UserRole.SUPER_ADMIN]}><ManagersPage /></RoleGuard> },

                              // Trainers (SuperAdmin / Manager)
                              { path: 'trainers', element: <RoleGuard roles={[UserRole.SUPER_ADMIN, UserRole.MANAGER]}><TrainersPage /></RoleGuard> },



                              // Specializations (SuperAdmin)
                              { path: 'specializations', element: <RoleGuard roles={[UserRole.SUPER_ADMIN]}><SpecializationsPage /></RoleGuard> },

                              // Enrollment Requests (SuperAdmin / Manager)
                              { path: 'enrollment-requests', element: <RoleGuard roles={[UserRole.SUPER_ADMIN, UserRole.MANAGER]}><EnrollmentRequestsPage /></RoleGuard> },

                              // Notifications
                              { path: 'notifications', element: <NotificationsPage /> },

                              // Reviews
                              { path: 'reviews', element: <ReviewsPage /> },

                              // Statistics (SuperAdmin / Manager)
                              { path: 'statistics', element: <RoleGuard roles={[UserRole.SUPER_ADMIN, UserRole.MANAGER]}><StatisticsPage /></RoleGuard> },

                              // Profile
                              { path: 'profile', element: <ProfilePage /> },

                              // Unauthorized
                              { path: 'unauthorized', element: <div style={{ padding: 24, textAlign: 'center' }}><h1>⛔ Access Denied</h1></div> },
                    ],
          },

          // Catch-all
          { path: '*', element: <Navigate to="/" replace /> },
]);

export default router;
