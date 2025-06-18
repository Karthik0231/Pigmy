import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminLayout from './layouts/Layout'; // Assuming AdminLayout is used for collector side too
import LoginPage from './pages/Login';
import Context from './Context/Context'; // This is UserContextProvider
import ProfilePage from './pages/ProfilePage';
import DepositPage from './pages/DepositPage';
import WithdrawalRequestPage from './pages/WithdrawalRequestPage';
import FeedbackPage from './pages/FeedbackPage'; // Import the new FeedbackPage
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <Context> {/* This should be UserContextProvider */}
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
          {/* Collector Routes under layout */}
          {/* Assuming AdminLayout is generic enough or you have a CollectorLayout */}
          <Route path="/" element={<AdminLayout />}>
          <Route path="/details" element={<ProfilePage />}/>
          <Route path="/deposit" element={<DepositPage />}/>
          <Route path="/withdrawals" element={<WithdrawalRequestPage/>} />
            {/* Nested inside AdminLayout */}
            {/* Add a default route or dashboard route here if needed */}
            {/* {{ edit_2 }} */}
            <Route path="/feedback" element={<FeedbackPage />} /> {/* Add the new feedback route */}
          </Route>
          </Route>
        </Routes>
      </Context>
    </Router>
  )
}

export default App;
