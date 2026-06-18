const express = require('express');
const Match = require('../models/Match');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Partner = require('../models/Partner');
const auth = require('../middleware/auth');
const { sendMatchEmail } = require('../utils/sendEmail');

const router = express.Router();

function formatMatch(m) {
    return {
        _id: m._id,
        senderId: m.senderId,
        senderName: m.senderName,
        senderEmail: m.senderEmail,
        recipientId: m.recipientId,
        partnerName: m.partnerName,
        partnerEmail: m.partnerEmail,
        status: m.status,
        date: m.date,
        time: m.time,
        food: m.food,
        location: m.location,
        notes: m.notes,
        matchOutfits: m.matchOutfits,
        twinColor: m.twinColor,
        excitement: m.excitement,
        createdAt: m.createdAt,
    };
}

router.get('/', auth, async (req, res) => {
    try {
        const matches = await Match.find({
            status: 'accepted',
            $or: [{ senderId: req.user._id }, { recipientId: req.user._id }],
        }).sort({ createdAt: -1 }).lean();
        res.json({ matches: matches.map(formatMatch) });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/sent', auth, async (req, res) => {
    try {
        const matches = await Match.find({ senderId: req.user._id }).sort({ createdAt: -1 }).lean();
        res.json({ matches: matches.map(formatMatch) });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/received', auth, async (req, res) => {
    try {
        const matches = await Match.find({
            recipientId: req.user._id,
            status: 'pending',
        }).sort({ createdAt: -1 }).lean();
        res.json({ matches: matches.map(formatMatch) });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/', auth, async (req, res) => {
    try {
        const { partnerName, date, time, food, location, notes, matchOutfits, twinColor, excitement } = req.body;
        if (!partnerName || !date || !time) {
            return res.status(400).json({ message: 'Partner name, date and time are required' });
        }

        const partner = await Partner.findOne({ name: { $regex: new RegExp(`^${partnerName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } }).lean();
        if (!partner) {
            return res.status(400).json({ message: `Partner "${partnerName}" not found in records` });
        }

        const partnerUser = await User.findOne({ email: partner.email.toLowerCase() });

        const match = await Match.create({
            senderId: req.user._id,
            senderName: req.user.name,
            senderEmail: req.user.email,
            recipientId: partnerUser ? partnerUser._id : null,
            partnerName,
            partnerEmail: partner.email,
            status: 'pending',
            date, time, food, location, notes, matchOutfits, twinColor, excitement,
        });

        let emailSent = false;
        if (partnerUser && partnerUser.verified) {
            try {
                await sendMatchEmail(req.user.name, partnerName, partner.email, {
                    date, time, food, location, notes
                });
                emailSent = true;
            } catch (emailErr) {
                console.error('Match email failed:', emailErr.message);
            }
        }

        if (partnerUser) {
            await Notification.create({
                userId: partnerUser._id,
                type: 'match_request',
                message: `${req.user.name} sent you a date invitation!`,
                relatedId: match._id,
            });
        }

        const responseMsg = emailSent
            ? `Invitation sent to ${partnerName} at ${partner.email}!`
            : partnerUser && !partnerUser.verified
                ? `Invitation sent! ${partnerName} will see it once they verify their email.`
                : `Invitation saved! ${partnerName} will see it when they join HeartSync.`;

        res.status(201).json({ message: responseMsg, match: formatMatch(match.toObject()), emailSent });
    } catch (err) {
        console.error('Match error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/:id/accept', auth, async (req, res) => {
    try {
        const match = await Match.findOne({ _id: req.params.id, recipientId: req.user._id, status: 'pending' });
        if (!match) return res.status(404).json({ message: 'Match not found or already responded' });

        match.status = 'accepted';
        await match.save();

        await Notification.updateOne(
            { userId: req.user._id, type: 'match_request', relatedId: match._id },
            { $set: { type: 'match_accepted', message: `You accepted ${match.senderName}'s invitation!`, read: true } }
        );

        await Notification.create({
            userId: match.senderId,
            type: 'match_accepted',
            message: `${req.user.name} accepted your date invitation!`,
            relatedId: match._id,
        });

        res.json({ message: 'Match accepted!', match: formatMatch(match.toObject()) });
    } catch (err) {
        console.error('Accept error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/:id/reject', auth, async (req, res) => {
    try {
        const match = await Match.findOne({ _id: req.params.id, recipientId: req.user._id, status: 'pending' });
        if (!match) return res.status(404).json({ message: 'Match not found or already responded' });

        match.status = 'rejected';
        await match.save();

        await Notification.updateOne(
            { userId: req.user._id, type: 'match_request', relatedId: match._id },
            { $set: { type: 'match_rejected', message: `You declined ${match.senderName}'s invitation.`, read: true } }
        );

        await Notification.create({
            userId: match.senderId,
            type: 'match_rejected',
            message: `${req.user.name} declined your date invitation.`,
            relatedId: match._id,
        });

        res.json({ message: 'Match declined', match: formatMatch(match.toObject()) });
    } catch (err) {
        console.error('Reject error:', err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
