import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from '../components/Layout';
import LandingPage from '../pages/LandingPage';
import IdeasPage from '../pages/IdeasPage';
import IdeaDetailPage from '../pages/IdeaDetailPage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import DashboardPage from '../pages/DashboardPage';
import ProtectedRoute from '../components/ProtectedRoute';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import AddIdeaPage from '../pages/AddIdeaPage';
import AboutPage from '../pages/AboutPage';
import PrivacyPage from '../pages/PrivacyPage';
import TermsPage from '../pages/TermsPage';
import DisclaimerPage from '../pages/DisclaimerPage';
import MyIdeasPage from '../pages/MyIdeasPage';
import EditProfilePage from '../pages/EditProfilePage';
import EditIdeaPage from '../pages/EditIdeaPage';
import FranchisePage from '../pages/FranchisePage';
import PostFranchisePage from '../pages/PostFranchisePage';
import FranchiseDetailPage from '../pages/FranchiseDetailPage';
import EditFranchisePage from '../pages/EditFranchisePage';
import ScrollToTop from '../components/ScrollToTop';

const router = createBrowserRouter([
    {
        path: '/',
        element: (
            <>
                <ScrollToTop />
                <Layout />
            </>
        ),
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
                path: 'forgot-password',
                element: <ForgotPasswordPage />,
            },
            {
                path: 'ideas',
                element: (
                    <ProtectedRoute>
                        <IdeasPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'ideas/:slug',
                element: (
                    <ProtectedRoute>
                        <IdeaDetailPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'franchise',
                element: (
                    <ProtectedRoute>
                        <FranchisePage />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'franchise/:slug',
                element: (
                    <ProtectedRoute>
                        <FranchiseDetailPage />
                    </ProtectedRoute>
                ),
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
        ],
    },
]);

export default function AppRouter() {
    return <RouterProvider router={router} />;
}
