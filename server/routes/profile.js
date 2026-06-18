const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
    res.json({ user: req.user });
});

router.put('/', auth, async (req, res) => {
    try {
        const { name, age, city, bio, interests } = req.body;
        const update = {};
        if (name) update.name = name;
        if (age) update.age = age;
        if (city) update.city = city;
        if (bio) update.bio = bio;
        if (interests) update.interests = interests;

        const user = await User.findByIdAndUpdate(req.user._id, update, { new: true }).select('-password');
        res.json({ user });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
