import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [loading, setLoading] = useState(true);

    const apiRef = useRef(null);
    if (!apiRef.current) {
        const baseURL = import.meta.env.VITE_API_URL || '/api';
        const instance = axios.create({ baseURL });
        instance.interceptors.request.use((config) => {
            const t = localStorage.getItem('token');
            if (t) config.headers.Authorization = `Bearer ${t}`;
            return config;
        });
        apiRef.current = instance;
    }
    const api = apiRef.current;

    const saveToken = useCallback((t) => {
        if (t) localStorage.setItem('token', t);
        else localStorage.removeItem('token');
        setToken(t);
    }, []);

    useEffect(() => {
        if (token) {
            api.get('/auth/me')
                .then((res) => setUser(res.data.user))
                .catch((err) => {
                    if (err.response?.status === 401) { saveToken(null); setUser(null); }
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [token]);

    const logout = () => {
        saveToken(null);
        setUser(null);
    };

    const updateProfile = async (data) => {
        const res = await api.put('/profile', data);
        setUser(res.data.user);
        return res.data;
    };

    const sendMatch = async (data) => {
        const res = await api.post('/match', data);
        return res.data;
    };

    const resendVerification = async () => {
        const res = await api.post('/auth/resend-verification');
        return res.data;
    };

    const getMatches = async () => {
        const res = await api.get('/match');
        return res.data.matches;
    };

    const getNotifications = async () => {
        const res = await api.get('/notifications');
        return { notifications: res.data.notifications, unreadCount: res.data.unreadCount };
    };

    const markNotificationRead = async (id) => {
        const res = await api.put(`/notifications/${id}/read`);
        return res.data.notification;
    };

    const markAllNotificationsRead = async () => {
        const res = await api.put('/notifications/read-all');
        return res.data;
    };

    const sendOtp = async (email) => {
        const res = await api.post('/auth/send-otp', { email });
        return res.data;
    };

    const verifyOtp = async (email, otp, profile = {}) => {
        const res = await api.post('/auth/verify-otp', { email, otp, ...profile });
        saveToken(res.data.token);
        setUser(res.data.user);
        return res.data;
    };

    const getPartnerStatus = async (gender) => {
        const res = await api.get(`/partners/${gender}/status`);
        return res.data.partners;
    };

    const acceptMatch = async (id) => {
        const res = await api.put(`/match/${id}/accept`);
        return res.data;
    };

    const rejectMatch = async (id) => {
        const res = await api.put(`/match/${id}/reject`);
        return res.data;
    };

    const getReceivedMatches = async () => {
        const res = await api.get('/match/received');
        return res.data.matches;
    };

    const getSentMatches = async () => {
        const res = await api.get('/match/sent');
        return res.data.matches;
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, logout, updateProfile, sendMatch, resendVerification, getMatches, getNotifications, markNotificationRead, markAllNotificationsRead, sendOtp, verifyOtp, getPartnerStatus, acceptMatch, rejectMatch, getReceivedMatches, getSentMatches, api }}>
            {children}
        </AuthContext.Provider>
    );
};
