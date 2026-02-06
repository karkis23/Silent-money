import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import ScrollToTop from '../components/ScrollToTop';

// Lazy load pages
const LandingPage = lazy(() => import('../pages/LandingPage'));
const IdeasPage = lazy(() => import('../pages/IdeasPage'));
const IdeaDetailPage = lazy(() => import('../pages/IdeaDetailPage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const SignupPage = lazy(() => import('../pages/SignupPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage'));
const AddIdeaPage = lazy(() => import('../pages/AddIdeaPage'));
const AboutPage = lazy(() => import('../pages/AboutPage'));
const PrivacyPage = lazy(() => import('../pages/PrivacyPage'));
const TermsPage = lazy(() => import('../pages/TermsPage'));
const DisclaimerPage = lazy(() => import('../pages/DisclaimerPage'));
const MyIdeasPage = lazy(() => import('../pages/MyIdeasPage'));
const EditProfilePage = lazy(() => import('../pages/EditProfilePage'));
const EditIdeaPage = lazy(() => import('../pages/EditIdeaPage'));
const FranchisePage = lazy(() => import('../pages/FranchisePage'));
const PostFranchisePage = lazy(() => import('../pages/PostFranchisePage'));
const FranchiseDetailPage = lazy(() => import('../pages/FranchiseDetailPage'));
const EditFranchisePage = lazy(() => import('../pages/EditFranchisePage'));
const ContactPage = lazy(() => import('../pages/ContactPage'));
const PublicProfilePage = lazy(() => import('../pages/PublicProfilePage'));
const ComparisonPage = lazy(() => import('../pages/ComparisonPage'));
const AdminDashboardPage = lazy(() => import('../pages/AdminDashboardPage'));
import ErrorPage from '../pages/ErrorPage';

import PageLoader from '../components/PageLoader';

const router = createBrowserRouter([
    {
        path: '/',
        element: (
            <Suspense fallback={<PageLoader />}>
                <ScrollToTop />
                <Layout />
            </Suspense>
        ),
        errorElement: <ErrorPage />,
        children: [
            {
                index: true,
                element: <LandingPage />,
            },
            {
                path: 'about',
                element: <AboutPage />,
            },
            {
                path: 'privacy',
                element: <PrivacyPage />,
            },
            {
                path: 'terms',
                element: <TermsPage />,
            },
            {
                path: 'disclaimer',
                element: <DisclaimerPage />,
            },
            {
                path: 'login',
                element: <LoginPage />,
            },
            {
                path: 'signup',
                element: <SignupPage />,
            },
            {
                path: 'contact',
                element: <ContactPage />,
            },
            {
                path: 'profile/:userId',
                element: <PublicProfilePage />,
            },
            {
                path: 'forgot-password',
                element: <ForgotPasswordPage />,
            },
            {
                path: 'ideas',
                element: <IdeasPage />,
            },
            {
                path: 'ideas/:slug',
                element: <IdeaDetailPage />,
            },
            {
                path: 'franchise',
                element: <FranchisePage />,
            },
            {
                path: 'franchise/:slug',
                element: <FranchiseDetailPage />,
            },
            {
                path: 'dashboard',
                element: (
                    <ProtectedRoute>
                        <DashboardPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'add-idea',
                element: (
                    <ProtectedRoute>
                        <AddIdeaPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'compare',
                element: (
                    <ProtectedRoute>
                        <ComparisonPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'my-ideas',
                element: (
                    <ProtectedRoute>
                        <MyIdeasPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'edit-profile',
                element: (
                    <ProtectedRoute>
                        <EditProfilePage />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'edit-idea/:id',
                element: (
                    <ProtectedRoute>
                        <EditIdeaPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'post-franchise',
                element: (
                    <ProtectedRoute>
                        <PostFranchisePage />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'edit-franchise/:id',
                element: (
                    <ProtectedRoute>
                        <EditFranchisePage />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'admin',
                element: (
                    <ProtectedRoute>
                        <AdminDashboardPage />
                    </ProtectedRoute>
                ),
            },
        ],
    },
]);

export default function AppRouter() {
    return <RouterProvider router={router} />;
}
