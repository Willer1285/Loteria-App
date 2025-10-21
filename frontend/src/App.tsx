import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import Users from './pages/admin/Users';
import AdminLotteries from './pages/admin/Lotteries';
import AdminTickets from './pages/admin/Tickets';
import AdminPayments from './pages/admin/Payments';
import EmailTemplates from './pages/admin/EmailTemplates';
import Settings from './pages/admin/Settings';
import Lotteries from './pages/Lotteries';
import PublicLotteries from './pages/PublicLotteries';
import LotteryDetail from './pages/LotteryDetail';
import MyTickets from './pages/MyTickets';
import VerifyTicket from './pages/VerifyTicket';
import Rankings from './pages/Rankings';
import Payments from './pages/Payments';
import Profile from './pages/Profile';
import Results from './pages/Results';
import PublicRankings from './pages/PublicRankings';
import HowToPlay from './pages/HowToPlay';

const PrivateRoute = ({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // adminOnly means admin or gerente
  if (adminOnly && user.role !== 'admin' && user.role !== 'gerente') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLotteries />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/results" element={<Results />} />
          <Route path="/public-rankings" element={<PublicRankings />} />
          <Route path="/how-to-play" element={<HowToPlay />} />
          <Route path="/lottery/:id" element={<LotteryDetail />} />

          {/* Private Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <PrivateRoute adminOnly>
                <AdminDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <PrivateRoute adminOnly>
                <Users />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/lotteries"
            element={
              <PrivateRoute adminOnly>
                <AdminLotteries />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/tickets"
            element={
              <PrivateRoute adminOnly>
                <AdminTickets />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/payments"
            element={
              <PrivateRoute adminOnly>
                <AdminPayments />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/email-templates"
            element={
              <PrivateRoute adminOnly>
                <EmailTemplates />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/settings"
            element={
              <PrivateRoute adminOnly>
                <Settings />
              </PrivateRoute>
            }
          />

          <Route
            path="/lotteries"
            element={
              <PrivateRoute>
                <Lotteries />
              </PrivateRoute>
            }
          />

          <Route
            path="/my-tickets"
            element={
              <PrivateRoute>
                <MyTickets />
              </PrivateRoute>
            }
          />

          <Route
            path="/verify-ticket"
            element={
              <PrivateRoute>
                <VerifyTicket />
              </PrivateRoute>
            }
          />

          <Route
            path="/rankings"
            element={
              <PrivateRoute>
                <Rankings />
              </PrivateRoute>
            }
          />

          <Route
            path="/payments"
            element={
              <PrivateRoute>
                <Payments />
              </PrivateRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
