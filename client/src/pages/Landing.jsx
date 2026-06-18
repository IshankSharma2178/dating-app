import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [showGender, setShowGender] = useState(false);

    const handleYes = () => {
        if (user) {
            navigate('/date-form');
        } else {
            setShowGender(true);
        }
    };

    const selectGender = (gender) => {
        navigate(`/login?gender=${gender}`);
    };

    return (
        <div className="container">
            <div style={{ fontSize: '120px', lineHeight: 1 }}>❤️</div>
            <h1>Will you go on a date with me ? 🙈</h1>
            <div className="btn">
                <button onClick={handleYes}>Yes</button>
                <button onClick={() => navigate(user ? '/dashboard' : '/login')}>No</button>
            </div>

            {showGender && (
                <div className="gender-overlay" onClick={() => setShowGender(false)}>
                    <div className="gender-box" onClick={(e) => e.stopPropagation()}>
                        <h2>Are you a boy or a girl?</h2>
                        <p>So I can show you the right person</p>
                        <div className="gender-options">
                            <button className="gender-btn" onClick={() => selectGender('boys')}>
                                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                                    <circle cx="20" cy="20" r="18" fill="#e8f4fd"/>
                                    <circle cx="20" cy="14" r="6" fill="#5dade2"/>
                                    <rect x="14" y="22" width="12" height="14" rx="3" fill="#5dade2"/>
                                    <rect x="12" y="24" width="4" height="10" rx="2" fill="#2e86c1"/>
                                    <rect x="24" y="24" width="4" height="10" rx="2" fill="#2e86c1"/>
                                </svg>
                                <span>Boy</span>
                            </button>
                            <button className="gender-btn" onClick={() => selectGender('girls')}>
                                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                                    <circle cx="20" cy="20" r="18" fill="#fce4ec"/>
                                    <circle cx="20" cy="14" r="6" fill="#f06292"/>
                                    <rect x="14" y="22" width="12" height="14" rx="3" fill="#f06292"/>
                                    <rect x="12" y="24" width="4" height="10" rx="2" fill="#ec407a"/>
                                    <rect x="24" y="24" width="4" height="10" rx="2" fill="#ec407a"/>
                                    <path d="M14 8 L20 4 L26 8" stroke="#f06292" strokeWidth="2" fill="none" strokeLinecap="round"/>
                                </svg>
                                <span>Girl</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
