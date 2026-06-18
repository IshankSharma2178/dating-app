import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DateForm from './pages/DateForm';
import HeartsBackground from './components/HeartsBackground';

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return null;
    return user ? children : <Navigate to="/login" />;
}

export default function App() {
    return (
        <>
            <HeartsBackground />
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/date-form" element={<ProtectedRoute><DateForm /></ProtectedRoute>} />
            </Routes>
        </>
    );
}
