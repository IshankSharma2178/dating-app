const Partner = require('../models/Partner');
const { getPartnersByGender } = require('./csvParser');

async function seedPartners() {
    try {
        const count = await Partner.countDocuments();
        if (count > 0) {
            console.log(`Partners collection already has ${count} entries, skipping seed`);
            return;
        }

        const boys = getPartnersByGender('boys').map(p => ({
            name: p.name,
            email: p.email.toLowerCase(),
            gender: 'boys',
            source: 'csv',
        }));

        const girls = getPartnersByGender('girls').map(p => ({
            name: p.name,
            email: p.email.toLowerCase(),
            gender: 'girls',
            source: 'csv',
        }));

        const all = [...boys, ...girls];
        if (all.length === 0) {
            console.log('No partners found in CSV to seed');
            return;
        }

        await Partner.insertMany(all, { ordered: false });
        console.log(`Seeded ${all.length} partners from CSV into database`);
    } catch (err) {
        if (err.code === 11000) {
            console.log('Some duplicate emails skipped during seed');
        } else {
            console.error('Seed partners error:', err.message);
        }
    }
}

module.exports = seedPartners;
