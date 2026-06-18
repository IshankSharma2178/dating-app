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
        const partners = await Partner.find({ gender, userId: { $ne: null } }).sort({ name: 1 }).lean();
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
        const partners = await Partner.find({ gender, userId: { $ne: null } }).sort({ name: 1 }).lean();
        const userIds = partners.map(p => p.userId).filter(Boolean);
        const existingUsers = await User.find({ _id: { $in: userIds } }).lean();
        const existingEmails = new Set(existingUsers.map(u => u.email));
        const result = partners.filter(p => existingEmails.has(p.email)).map(p => ({
            name: p.name,
            email: p.email,
            signedUp: true,
        }));
        res.json({ partners: result });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
