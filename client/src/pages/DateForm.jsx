import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import partnersData from '../data/partners.json';

export default function DateForm({ embedded = false }) {
    const navigate = useNavigate();
    const { user, sendMatch, getPartnerStatus } = useAuth();
    const gender = user?.gender || 'boys';
    const oppositeGender = gender === 'boys' ? 'girls' : 'boys';

    const [names, setNames] = useState(() => {
        const all = partnersData[oppositeGender] || [];
        return all.map(p => p.name);
    });
    const [partnerStatus, setPartnerStatus] = useState({});
    const [form, setForm] = useState({
        date: '', time: '', food: '', location: '', notes: '',
        matchOutfits: 'Yes, absolutely', twinColor: '#ff4d4d', excitement: 10,
    });
    const [partnerSearch, setPartnerSearch] = useState('');
    const [partnerName, setPartnerName] = useState('');
    const [filtered, setFiltered] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setFiltered(names.filter((n) => n.toLowerCase().includes(partnerSearch.toLowerCase())));
    }, [partnerSearch, names]);

    useEffect(() => {
        const handleClick = (e) => { if (!e.target.closest('.search-dropdown')) setIsOpen(false); };
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

    useEffect(() => {
        getPartnerStatus(oppositeGender).then((partners) => {
            const statusMap = {};
            const allNames = [...names];
            partners.forEach(p => {
                statusMap[p.name] = p.signedUp;
                if (!allNames.includes(p.name)) allNames.push(p.name);
            });
            setPartnerStatus(statusMap);
            const sorted = [...allNames].sort((a, b) => ((statusMap[b] ? 1 : 0) - (statusMap[a] ? 1 : 0)));
            setNames(sorted);
        }).catch(() => {});
    }, []);

    const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const selectName = (name) => {
        if (partnerStatus[name] !== false) {
            setPartnerName(name);
            setPartnerSearch(name);
            setIsOpen(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!partnerName) { setError('Please select a partner name'); return; }
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            await sendMatch({ ...form, partnerName });
            setSuccess(`Date invitation sent to ${partnerName}!`);
            setForm({ date: '', time: '', food: '', location: '', notes: '', matchOutfits: 'Yes, absolutely', twinColor: '#ff4d4d', excitement: 10 });
            setPartnerName('');
            setPartnerSearch('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send invitation');
        } finally {
            setLoading(false);
        }
    };

    const subtitle = gender === 'boys' ? 'Now help your girl plan the perfect day for us:' : 'Now help your boy plan the perfect day for us:';
    const btnText = gender === 'boys' ? 'Send to My Girl 💌' : 'Send to My Boy 💌';

    return (
        <div className="container">
            <div style={{ fontSize: '60px', lineHeight: 1, marginTop: '20px' }}>💖</div>
            <h1>Hehehehe, I knew it! 🥰</h1>
            <p className="subtitle">{subtitle}</p>

            {error && <div className="alert alert-error" style={{ width: '100%', maxWidth: '420px' }}>{error}</div>}
            {success && <div className="alert alert-success" style={{ width: '100%', maxWidth: '420px' }}>{success}</div>}

            <form onSubmit={handleSubmit} className="date-form">
                <div className="form-group">
                    <label>Your Name</label>
                    <input type="text" value={user?.name || ''} disabled style={{ background: '#f5f5f5' }} />
                </div>

                <div className="form-group">
                    <label>Choose your partner</label>
                    <div className="search-dropdown">
                        <input
                            type="text"
                            value={partnerSearch}
                            onChange={(e) => { setPartnerSearch(e.target.value); setIsOpen(true); }}
                            onFocus={() => setIsOpen(true)}
                            placeholder="Type to search names..."
                            autoComplete="off"
                        />
                        {isOpen && (
                            <div className="dropdown-list open">
                                {filtered.length === 0 ? (
                                    <div className="dropdown-item no-result">No names found</div>
                                ) : (
                                    filtered.map((name) => {
                                        const isSignedUp = partnerStatus[name];
                                        const canSelect = isSignedUp !== false;
                                        return (
                                            <div
                                                key={name}
                                                className={`dropdown-item ${canSelect ? '' : 'disabled'}`}
                                                onClick={() => canSelect && selectName(name)}
                                                style={canSelect ? {} : { opacity: 0.5, cursor: 'not-allowed' }}
                                            >
                                                <span>{name}</span>
                                                <span className="partner-badge" style={{ fontSize: '11px', marginLeft: 'auto', color: isSignedUp ? '#27ae60' : '#999' }}>
                                                    {isSignedUp === undefined ? '...' : isSignedUp ? '✓ On HeartSync' : '○ Not on app yet'}
                                                </span>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </div>
                    {partnerName && <p className="field-hint" style={{ color: '#e74c3c', fontWeight: 600 }}>Selected: {partnerName}</p>}
                </div>

                <div className="form-group">
                    <label>When are you free? 📅</label>
                    <input type="date" name="date" value={form.date} onChange={handleChange} required />
                </div>

                <div className="form-group">
                    <label>What time should I pick you up? ⏰</label>
                    <input type="time" name="time" value={form.time} onChange={handleChange} required />
                </div>

                <div className="form-group">
                    <label>What are we eating? 🍕</label>
                    <select name="food" value={form.food} onChange={handleChange}>
                        <option value="" disabled>Select a cuisine...</option>
                        <option value="Cozy Cafe Date">☕ Cozy Cafe & Desserts</option>
                        <option value="Fast Food / Pizza">🍕 Pizza / Burgers & Fries</option>
                        <option value="Fine Dining">🕯️ Fancy Candlelight Dinner</option>
                        <option value="Street Food Hop">🍿 Street Food & Chaotic Walking</option>
                        <option value="Surprise Me">🎁 Keep it a secret, surprise me!</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Preferred Location / Vibe 📍</label>
                    <input type="text" name="location" value={form.location} onChange={handleChange} placeholder="e.g., Cozy cafe, Sushi, Surprise me!" />
                </div>

                <div className="form-group">
                    <label>Should we match outfit colors? 👗👔</label>
                    <div className="radio-group">
                        <label><input type="radio" name="matchOutfits" value="Yes, absolutely" checked={form.matchOutfits === 'Yes, absolutely'} onChange={handleChange} /> Yes, obviously! Twin with me.</label>
                        <label><input type="radio" name="matchOutfits" value="No, let us surprise each other" checked={form.matchOutfits === 'No, let us surprise each other'} onChange={handleChange} /> No, let's surprise each other.</label>
                    </div>
                </div>

                {form.matchOutfits === 'Yes, absolutely' && (
                    <div className="form-group">
                        <label>Pick a matching color 🎨</label>
                        <input type="color" name="twinColor" value={form.twinColor} onChange={handleChange} />
                    </div>
                )}

                <div className="form-group">
                    <label>Your excitement level 📈</label>
                    <div className="range-container">
                        <span>A little bit🤏</span>
                        <input type="range" name="excitement" min="1" max="10" value={form.excitement} onChange={handleChange} />
                        <span>To the moon! 🚀</span>
                    </div>
                </div>

                <div className="form-group">
                    <label>Special requests? 🧸</label>
                    <textarea name="notes" value={form.notes} onChange={handleChange} rows="3" placeholder="Favorite snacks, song requests, or demands..." />
                </div>

                {!user?.verified && (
                    <div className="alert alert-error" style={{ marginBottom: '12px' }}>
                        Please verify your email before sending invitations.
                    </div>
                )}

                <button type="submit" className="submit-btn" disabled={loading || !user?.verified}>
                    {loading ? 'Sending...' : btnText}
                </button>
            </form>

            {!embedded && (
                <button className="btn" style={{ marginTop: '8px', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
                    ← Back to Dashboard
                </button>
            )}
        </div>
    );
}
