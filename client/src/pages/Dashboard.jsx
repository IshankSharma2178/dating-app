import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DateForm from './DateForm';

const INTERESTS = ['Travel', 'Music', 'Photography', 'Cooking', 'Fitness', 'Reading', 'Art', 'Dance', 'Coffee', 'Movies', 'Dogs', 'Food'];

export default function Dashboard() {
    const navigate = useNavigate();
    const { user, logout, updateProfile, resendVerification, getMatches, getNotifications, markNotificationRead, markAllNotificationsRead, acceptMatch, rejectMatch, getReceivedMatches, getSentMatches } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [form, setForm] = useState({
        name: user?.name || '',
        age: user?.age || '',
        city: user?.city || '',
        phone: user?.phone || '',
        bio: user?.bio || '',
        interests: user?.interests || [],
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [verifyLoading, setVerifyLoading] = useState(false);

    const [matches, setMatches] = useState([]);
    const [matchesLoading, setMatchesLoading] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState(null);

    const [sentMatches, setSentMatches] = useState([]);
    const [receivedMatches, setReceivedMatches] = useState([]);
    const [matchSubTab, setMatchSubTab] = useState('accepted');

    const [matchActionLoading, setMatchActionLoading] = useState(null);
    const [matchActionError, setMatchActionError] = useState('');

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifsLoading, setNotifsLoading] = useState(false);

    const activeItem = activeTab === 'matches' ? 'My Matches' : activeTab === 'notifications' ? 'Notifications' : activeTab === 'date-form' ? 'Find a Date' : 'Profile';

    useEffect(() => {
        if (activeTab === 'matches') {
            setSelectedMatch(null);
            setMatchesLoading(true);
            setMatchSubTab('accepted');
            getMatches()
                .then((data) => { setMatches(data); setMatchesLoading(false); })
                .catch(() => { setMatchesLoading(false); });
        } else if (activeTab === 'notifications') {
            setNotifsLoading(true);
            getNotifications()
                .then((data) => { setNotifications(data.notifications); setUnreadCount(data.unreadCount); setNotifsLoading(false); })
                .catch(() => { setNotifsLoading(false); });
        }
    }, [activeTab]);

    const fetchMatchSubTab = (tab) => {
        setMatchSubTab(tab);
        setSelectedMatch(null);
        setMatchesLoading(true);
        if (tab === 'accepted') {
            getMatches()
                .then((data) => { setMatches(data); setMatchesLoading(false); })
                .catch(() => { setMatchesLoading(false); });
        } else if (tab === 'sent') {
            getSentMatches()
                .then((data) => { setSentMatches(data); setMatchesLoading(false); })
                .catch(() => { setMatchesLoading(false); });
        } else if (tab === 'received') {
            getReceivedMatches()
                .then((data) => { setReceivedMatches(data); setMatchesLoading(false); })
                .catch(() => { setMatchesLoading(false); });
        }
    };

    const markAsRead = async (id) => {
        try {
            await markNotificationRead(id);
            setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
            setUnreadCount((c) => Math.max(0, c - 1));
        } catch {}
    };

    const markAllRead = async () => {
        try {
            await markAllNotificationsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch {}
    };

    const handleAcceptMatch = async (notif) => {
        setMatchActionLoading(notif._id);
        setMatchActionError('');
        try {
            await acceptMatch(notif.relatedId);
            const result = await getNotifications();
            setNotifications(result.notifications);
            setUnreadCount(result.unreadCount);
        } catch (err) {
            setMatchActionError(err.response?.data?.message || 'Accept failed');
        } finally {
            setMatchActionLoading(null);
        }
    };

    const handleRejectMatch = async (notif) => {
        setMatchActionLoading(notif._id);
        setMatchActionError('');
        try {
            await rejectMatch(notif.relatedId);
            const result = await getNotifications();
            setNotifications(result.notifications);
            setUnreadCount(result.unreadCount);
        } catch (err) {
            setMatchActionError(err.response?.data?.message || 'Reject failed');
        } finally {
            setMatchActionLoading(null);
        }
    };

    const toggleInterest = (i) => {
        setForm((f) => ({
            ...f,
            interests: f.interests.includes(i) ? f.interests.filter((x) => x !== i) : [...f.interests, i],
        }));
    };

    const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const handleSave = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);
        try {
            await updateProfile(form);
            setMessage('Profile updated!');
        } catch (err) {
            setError(err.response?.data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setVerifyLoading(true);
        try {
            await resendVerification();
            setMessage('Verification email sent!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend');
        } finally {
            setVerifyLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const sideItems = [
        { key: 'profile', label: 'Profile', icon: '👤' },
        { key: 'date-form', label: 'Find a Date', icon: '💌' },
        { key: 'notifications', label: 'Notifications', icon: '🔔', badge: unreadCount },
        { key: 'matches', label: 'My Matches', icon: '❤️' },
    ];

    return (
        <div className="dash-layout">
            <div className={`dash-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="dash-sidebar-header">
                    <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '22px' }}>❤️</span>
                        <span style={{ fontSize: '18px', fontWeight: 800, color: '#e74c3c' }}>HeartSync</span>
                    </div>
                    <button className="dash-close-btn" onClick={() => setSidebarOpen(false)}>✕</button>
                </div>

                <div className="dash-sidebar-user">
                    <div className="dash-sidebar-avatar">{user?.name?.charAt(0)?.toUpperCase() || '?'}</div>
                    <div>
                        <div className="dash-sidebar-name">{user?.name || 'User'}</div>
                        <div className="dash-sidebar-email">{user?.email}</div>
                    </div>
                </div>

                <nav className="dash-nav">
                    {sideItems.map((item) => (
                        <button
                            key={item.key}
                            className={`dash-nav-item ${activeTab === item.key ? 'active' : ''}`}
                            onClick={() => { setActiveTab(item.key); setSidebarOpen(false); }}
                        >
                            <span className="dash-nav-icon">{item.icon}</span>
                            <span>{item.label}</span>
                            {item.badge > 0 && <span className="badge-unread">{item.badge}</span>}
                        </button>
                    ))}
                </nav>

                <div className="dash-sidebar-footer">
                    <button onClick={() => setActiveTab('date-form')} className="dash-find-btn">Find a Date</button>
                    <button onClick={handleLogout} className="dash-logout-btn">Logout</button>
                </div>
            </div>

            <div className="dash-main">
                <div className="dash-topbar">
                    <button className="dash-hamburger" onClick={() => setSidebarOpen(true)}>☰</button>
                    <h2>{activeItem}</h2>
                    <div />
                </div>

                <div className="dash-content">
                    {activeTab === 'profile' && (
                        <div className="dash-card">
                            {!user?.verified && (
                                <div className="verify-banner">
                                    <p>Please verify your email to send date invitations</p>
                                    <button onClick={handleResend} disabled={verifyLoading}>
                                        {verifyLoading ? 'Sending...' : 'Resend'}
                                    </button>
                                </div>
                            )}

                            <div className="profile-preview">
                                <div className="profile-avatar">
                                    {user?.name?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                                <div className="profile-preview-info">
                                    <h3>{user?.name || 'User'}</h3>
                                    <p>{user?.email} - {user?.gender === 'boys' ? 'Boy' : 'Girl'}</p>
                                    {user?.city && <p>📍 {user.city}{user?.age ? `, ${user.age}` : ''}</p>}
                                </div>
                            </div>

                            {message && <div className="alert alert-success">{message}</div>}
                            {error && <div className="alert alert-error">{error}</div>}

                            <form onSubmit={handleSave}>
                                <div className="form-group">
                                    <label>Your Name</label>
                                    <input name="name" value={form.name} onChange={handleChange} placeholder="Enter your name" required />
                                </div>
                                <div className="form-group">
                                    <label>Age</label>
                                    <input name="age" type="number" value={form.age} onChange={handleChange} placeholder="Your age" min={18} />
                                </div>
                                <div className="form-group">
                                    <label>City 🌆</label>
                                    <input name="city" value={form.city} onChange={handleChange} placeholder="e.g., Mumbai, Delhi, Bangalore" />
                                </div>
                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input name="phone" value={form.phone} onChange={handleChange} placeholder="e.g., +91 98765 43210" />
                                </div>
                                <div className="form-group">
                                    <label>About you</label>
                                    <textarea name="bio" value={form.bio} onChange={handleChange} rows={3} placeholder="Write a short bio..." />
                                </div>
                                <div className="form-group">
                                    <label>Your interests</label>
                                    <div className="tag-group">
                                        {INTERESTS.map((i) => (
                                            <span key={i} className={`interest-tag ${form.interests.includes(i) ? 'selected' : ''}`} onClick={() => toggleInterest(i)}>{i}</span>
                                        ))}
                                    </div>
                                </div>
                                <button type="submit" className="submit-btn" disabled={loading}>
                                    {loading ? 'Saving...' : 'Save Profile'}
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'date-form' && (
                        <DateForm embedded />
                    )}

                    {activeTab === 'notifications' && (
                        <div className="dash-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h3 style={{ margin: 0 }}>Notifications</h3>
                                {unreadCount > 0 && (
                                    <button onClick={markAllRead} className="btn-small" style={{ background: 'none', border: '1px solid #ccc', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>
                                        Mark all read
                                    </button>
                                )}
                            </div>
                            {!user?.verified && (
                                <div className="notif-item warning" style={{ marginBottom: '12px' }}>
                                    <span className="notif-icon">⚠️</span>
                                    <span>Please verify your email to send date invitations</span>
                                    <button onClick={handleResend} disabled={verifyLoading} className="btn-small" style={{ marginLeft: 'auto', background: '#f39c12', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit' }}>
                                        {verifyLoading ? '...' : 'Resend'}
                                    </button>
                                </div>
                            )}
                            {matchActionError && <div className="alert alert-error" style={{ marginBottom: '12px' }}>{matchActionError}</div>}
                            {notifsLoading ? (
                                <p style={{ textAlign: 'center', color: '#888' }}>Loading notifications...</p>
                            ) : notifications.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                                    <div style={{ fontSize: '36px', marginBottom: '8px' }}>🔔</div>
                                    <p style={{ color: '#888' }}>No notifications yet</p>
                                </div>
                            ) : (
                                <div className="notif-list">
                                    {notifications.map((n) => (
                                        <div key={n._id} className={`notif-item ${n.type} ${n.read ? 'read' : 'unread'}`}>
                                            <span className="notif-icon">
                                                {n.type === 'match_request' ? '💌' : n.type === 'match_accepted' ? '✅' : n.type === 'match_rejected' ? '💔' : 'ℹ️'}
                                            </span>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ margin: 0, fontSize: '13px', fontWeight: n.read ? 400 : 600 }}>{n.message}</p>
                                                <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#999' }}>{new Date(n.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            {n.type === 'match_request' && (
                                                <div style={{ display: 'flex', gap: '6px', marginLeft: '8px' }}>
                                                    <button
                                                        className="btn-small btn-accept"
                                                        disabled={matchActionLoading === n._id}
                                                        onClick={(e) => { e.stopPropagation(); handleAcceptMatch(n); }}
                                                        style={{ background: '#27ae60', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit' }}
                                                    >
                                                        {matchActionLoading === n._id ? '...' : 'Accept'}
                                                    </button>
                                                    <button
                                                        className="btn-small btn-reject"
                                                        disabled={matchActionLoading === n._id}
                                                        onClick={(e) => { e.stopPropagation(); handleRejectMatch(n); }}
                                                        style={{ background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit' }}
                                                    >
                                                        {matchActionLoading === n._id ? '...' : 'Reject'}
                                                    </button>
                                                </div>
                                            )}
                                            {n.type !== 'match_request' && !n.read && (
                                                <span className="unread-dot" onClick={() => markAsRead(n._id)} style={{ cursor: 'pointer' }} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'matches' && (
                        <div className="dash-card">
                            <div className="match-subtabs">
                                <button className={`match-subtab ${matchSubTab === 'accepted' ? 'active' : ''}`} onClick={() => fetchMatchSubTab('accepted')}>My Matches</button>
                                <button className={`match-subtab ${matchSubTab === 'sent' ? 'active' : ''}`} onClick={() => fetchMatchSubTab('sent')}>Sent</button>
                                <button className={`match-subtab ${matchSubTab === 'received' ? 'active' : ''}`} onClick={() => fetchMatchSubTab('received')}>Received</button>
                            </div>

                            {selectedMatch && (
                                <div className="match-detail-overlay" onClick={() => setSelectedMatch(null)}>
                                    <div className="match-detail-card" onClick={(e) => e.stopPropagation()}>
                                        <button className="match-detail-close" onClick={() => setSelectedMatch(null)}>✕</button>
                                        <h3 style={{ marginTop: 0 }}>{selectedMatch.partnerName}</h3>
                                        <div style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
                                            {selectedMatch.senderId === user?._id ? (
                                                <><div><strong>Email:</strong> {selectedMatch.partnerEmail}</div>
                                                    {selectedMatch.partnerPhone && <div><strong>Phone:</strong> {selectedMatch.partnerPhone}</div>}</>
                                            ) : (
                                                <><div><strong>Email:</strong> {selectedMatch.senderEmail}</div>
                                                    {selectedMatch.senderPhone && <div><strong>Phone:</strong> {selectedMatch.senderPhone}</div>}</>
                                            )}
                                        </div>
                                        <div className="match-detail-grid">
                                            <div><strong>Date:</strong> {selectedMatch.date}</div>
                                            <div><strong>Time:</strong> {selectedMatch.time}</div>
                                            {selectedMatch.food && <div><strong>Food:</strong> {selectedMatch.food}</div>}
                                            {selectedMatch.location && <div><strong>Location:</strong> {selectedMatch.location}</div>}
                                            {selectedMatch.notes && <div className="full-width"><strong>Notes:</strong><br />{selectedMatch.notes}</div>}
                                            {selectedMatch.matchOutfits && <div><strong>Outfits:</strong> {selectedMatch.matchOutfits}</div>}
                                            {selectedMatch.twinColor && <div><strong>Twin Color:</strong> <span style={{ display: 'inline-block', width: '14px', height: '14px', background: selectedMatch.twinColor, borderRadius: '3px', verticalAlign: 'middle', border: '1px solid #ddd' }} /> {selectedMatch.twinColor}</div>}
                                            {selectedMatch.excitement && <div><strong>Excitement:</strong> {'🔥'.repeat(selectedMatch.excitement)}</div>}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {matchesLoading ? (
                                <p style={{ textAlign: 'center', color: '#888' }}>Loading...</p>
                            ) : matchSubTab === 'accepted' && matches.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>💔</div>
                                    <p style={{ color: '#888', marginBottom: '16px' }}>No matches yet. Go find your date!</p>
                                    <button onClick={() => navigate('/date-form')} className="submit-btn" style={{ width: 'auto', padding: '10px 24px' }}>
                                        Find a Date
                                    </button>
                                </div>
                            ) : matchSubTab === 'sent' && sentMatches.length === 0 ? (
                                <p style={{ textAlign: 'center', color: '#888', padding: '20px 0' }}>No sent requests</p>
                            ) : matchSubTab === 'received' && receivedMatches.length === 0 ? (
                                <p style={{ textAlign: 'center', color: '#888', padding: '20px 0' }}>No received requests</p>
                            ) : (
                                <div className="match-list">
                                    {(matchSubTab === 'accepted' ? matches : matchSubTab === 'sent' ? sentMatches : receivedMatches).map((m) => (
                                        <div key={m._id} className="match-card" onClick={() => setSelectedMatch(m)} style={{ cursor: 'pointer' }}>
                                            <div className="match-card-header">
                                                <span className="match-partner">{m.partnerName}</span>
                                                <span className="match-date">{new Date(m.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="match-details">
                                                <p>📅 {m.date} at {m.time}</p>
                                                {m.food && <p>🍕 {m.food}</p>}
                                                {m.location && <p>📍 {m.location}</p>}
                                            </div>
                                            <div className="match-status">
                                                <span className={`status-badge ${m.status}`}>
                                                    {m.status === 'accepted' ? 'Matched' : m.status === 'pending' ? (matchSubTab === 'sent' ? 'Awaiting Response' : 'Pending') : 'Declined'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
