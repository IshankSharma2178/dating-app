const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderName: { type: String, required: true },
    senderEmail: { type: String, required: true },
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    partnerName: { type: String, required: true },
    partnerEmail: { type: String, required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    date: { type: String, required: true },
    time: { type: String, required: true },
    food: { type: String, default: '' },
    location: { type: String, default: '' },
    notes: { type: String, default: '' },
    matchOutfits: { type: String, default: '' },
    twinColor: { type: String, default: '' },
    excitement: { type: Number, default: 10 },
}, { timestamps: true });

module.exports = mongoose.model('Match', matchSchema);
