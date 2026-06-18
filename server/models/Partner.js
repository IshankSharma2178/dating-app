const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    gender: { type: String, enum: ['boys', 'girls'], required: true },
    source: { type: String, enum: ['csv', 'auto'], default: 'csv' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

partnerSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('Partner', partnerSchema);
