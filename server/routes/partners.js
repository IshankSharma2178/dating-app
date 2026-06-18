const express = require('express');
const User = require('../models/User');
const Partner = require('../models/Partner');

const router = express.Router();

router.get('/:gender', async (req, res) => {
    try {
        const { gender } = req.params;
        if (gender !== 'boys' && gender !== 'girls') {
            return res.status(400).json({ message: 'Invalid gender. Use "boys" or "girls".' });
        }
        const partners = await Partner.find({ gender }).sort({ name: 1 }).lean();
        res.json({ partners: partners.map(p => ({ name: p.name, email: p.email })) });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/:gender/status', async (req, res) => {
    try {
        const { gender } = req.params;
        if (gender !== 'boys' && gender !== 'girls') {
            return res.status(400).json({ message: 'Invalid gender. Use "boys" or "girls".' });
        }
        const partners = await Partner.find({ gender }).sort({ name: 1 }).lean();
        const emails = partners.map(p => p.email.toLowerCase());
        const signedUpUsers = await User.find({ email: { $in: emails } }).lean();
        const signedUpEmails = new Set(signedUpUsers.map(u => u.email));
        const result = partners.map(p => ({
            name: p.name,
            email: p.email,
            signedUp: signedUpEmails.has(p.email.toLowerCase()),
        }));
        res.json({ partners: result });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
