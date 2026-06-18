const express = require('express');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50);
        const unreadCount = await Notification.countDocuments({ userId: req.user._id, read: false });
        res.json({ notifications, unreadCount });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/:id/read', auth, async (req, res) => {
    try {
        const notif = await Notification.findOne({ _id: req.params.id, userId: req.user._id });
        if (!notif) return res.status(404).json({ message: 'Notification not found' });
        notif.read = true;
        await notif.save();
        res.json({ notification: notif });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/read-all', auth, async (req, res) => {
    try {
        await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
        res.json({ message: 'All notifications marked as read' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
