import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminLayout from './layouts/Layout'; // Assuming AdminLayout is used for collector side too
import LoginPage from './pages/Login';
import Context from './Context/Context';
import AssignedCustomers from './pages/AssignedCustomers';
import DepositManagement from './pages/DepositManagement';
import CollectorWithdrawalRequestsPage from './pages/CollectorWithdrawalRequestsPage';
import CustomerStatementPage from './pages/CustomerStatementPage';
import ProtectedRoute from './components/ProtectedRoute'; // Import the ProtectedRoute component
import FeedbackPage from './pages/FeedbackPage';

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <Context>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Collector Routes protected by token */}
          {/* The ProtectedRoute component will check for the token */}
          <Route element={<ProtectedRoute />}>
             {/* Routes nested inside ProtectedRoute will only render if token exists */}
             {/* These routes will also use the AdminLayout */}
             <Route path="/" element={<AdminLayout />}>
                {/* Nested inside AdminLayout */}
                {/* Add a default route or dashboard route here if needed */}
                <Route path="/assigned-customers" element={<AssignedCustomers />} />
                <Route path="/manage-deposits" element={<DepositManagement/>} />
                <Route path="/withdrawal-requests" element={<CollectorWithdrawalRequestsPage/>} />
                <Route path="/customer-statements/:customerId" element={<CustomerStatementPage />} />
                <Route path="/feedbacks" element={<FeedbackPage/>} />
             </Route>
          </Route>

           {/* Fallback route for unmatched paths (optional) */}
           {/* <Route path="*" element={<Navigate to="/login" />} /> */}

        </Routes>
      </Context>
    </Router>
  )
}

export default App
