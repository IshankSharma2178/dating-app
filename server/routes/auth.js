const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Otp = require('../models/Otp');
const Partner = require('../models/Partner');
const auth = require('../middleware/auth');
const { sendVerificationEmail, sendOtpEmail } = require('../utils/sendEmail');

const router = express.Router();

const generateToken = (user) => {
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

router.post('/send-otp', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await Otp.create({
            email: email.toLowerCase(),
            otp,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        });

        try {
            await sendOtpEmail(email, otp);
        } catch (emailErr) {
            console.error('OTP email failed:', emailErr.message);
        }

        res.json({ message: 'OTP sent to your email' });
    } catch (err) {
        console.error('Send OTP error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp, name, gender, age, city, bio, interests } = req.body;
        if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

        const record = await Otp.findOne({
            email: email.toLowerCase(),
            otp,
            used: false,
            expiresAt: { $gt: new Date() },
        });

        if (!record) return res.status(400).json({ message: 'Invalid or expired OTP' });

        record.used = true;
        await record.save();

        let user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            const cleanName = email.split('@')[0];
            user = await User.create({
                name: name || cleanName,
                email: email.toLowerCase(),
                password: crypto.randomBytes(20).toString('hex'),
                gender: gender || 'boys',
                age: age || null,
                city: city || '',
                bio: bio || '',
                interests: interests || [],
                verified: true,
            });
        } else {
            if (name) user.name = name;
            if (gender) user.gender = gender;
            if (age) user.age = age;
            if (city !== undefined) user.city = city;
            if (bio !== undefined) user.bio = bio;
            if (interests) user.interests = interests;
            await user.save();
        }

        const existingPartner = await Partner.findOne({ email: email.toLowerCase() }).lean();
        if (!existingPartner) {
            try {
                await Partner.create({
                    name: user.name,
                    email: user.email,
                    gender: user.gender || 'boys',
                    source: 'auto',
                    userId: user._id,
                });
                console.log(`Auto-added ${user.name} (${user.email}) to partners`);
            } catch (addErr) {
                if (addErr.code !== 11000) console.error('Auto-add partner error:', addErr.message);
            }
        }

        const token = generateToken(user);
        res.json({
            token,
            user: { id: user._id, name: user.name, email: user.email, gender: user.gender, verified: user.verified, age: user.age, city: user.city, bio: user.bio, interests: user.interests },
        });
    } catch (err) {
        console.error('Verify OTP error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/resend-verification', auth, async (req, res) => {
    try {
        const user = req.user;
        if (user.verified) {
            return res.status(400).json({ message: 'Already verified' });
        }
        const verificationToken = crypto.randomBytes(32).toString('hex');
        user.verificationToken = verificationToken;
        user.verificationTokenExpires = Date.now() + 3600000;
        await user.save();
        await sendVerificationEmail(user.email, verificationToken);
        res.json({ message: 'Verification email resent' });
    } catch (err) {
        console.error('Resend error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/me', auth, async (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;
