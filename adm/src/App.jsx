import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminLayout from './layouts/Layout';
import LoginPage from './pages/Login';
// import DashboardPage from './pages/DashboardPage'; // Uncomment if you have a dashboard
// import SettingsPage from './pages/SettingsPage'; // Uncomment if you have settings
import Context from './Context/Context';
import Collectors from './pages/Collectors';
import PigmyPlans from './pages/PigmyPlans';
import Customers from './pages/Customers';
import ProtectedRoute from './components/ProtectedRoute'; // Import the ProtectedRoute component
import PaymentManagement from './pages/PaymentManagement';
import FeedbackManagement from './pages/FeedbackManagement';
import ReportsPage from './pages/Rpt';

function App() {
  return (
    <Router>
      <Context>
        <Routes>
          {/* Public Routes */}
          {/* The root path can also be the login page */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Admin Routes protected by token */}
          {/* The ProtectedRoute component will check for the token */}
          <Route element={<ProtectedRoute />}>
             {/* Routes nested inside ProtectedRoute will only render if token exists */}
             {/* These routes will also use the AdminLayout */}
             <Route path="/" element={<AdminLayout />}>
                {/* Nested inside AdminLayout */}
                {/* Add a default route or dashboard route here if needed, e.g., <Route index element={<DashboardPage />} /> */}
                <Route path="/collectors" element={<Collectors/>} />
                <Route path="/pigmyplans" element={<PigmyPlans/>} />
                <Route path="/customers" element={<Customers/>} />
                <Route path="/payments" element={<PaymentManagement/>} />
                <Route path="/feedbacks" element={<FeedbackManagement/>} />
                <Route path="/dashboard" element={<ReportsPage/>} />
                {/* Add other protected admin routes here */}
                {/* <Route path="/settings" element={<SettingsPage />} /> */}
             </Route>
          </Route>

           {/* Fallback route for unmatched paths (optional) */}
           {/* <Route path="*" element={<Navigate to="/login" />} /> */}

        </Routes>
      </Context>
    </Router>
  );
}

export default App;
