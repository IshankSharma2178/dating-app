const fs = require('fs');
const path = require('path');

const CSV_PATH = path.join(__dirname, '..', 'data', 'partners.csv');

function parseCSV() {
    const raw = fs.readFileSync(CSV_PATH, 'utf-8').trim();
    const lines = raw.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());

    const records = [];
    for (let i = 1; i < lines.length; i++) {
        const vals = lines[i].split(',');
        const record = {};
        headers.forEach((h, idx) => {
            record[h] = (vals[idx] || '').trim();
        });
        records.push(record);
    }
    return records;
}

function getPartnersByGender(gender) {
    const all = parseCSV();
    const mappedGender = gender === 'boys' ? 'Male' : 'Female';
    return all
        .filter(r => r['Gender (Guessed)'] === mappedGender)
        .map(r => ({
            name: r['Name'],
            email: r['Email'],
        }));
}

function findPartnerByName(name) {
    const all = parseCSV();
    return all.find(r => r['Name'].toLowerCase() === name.toLowerCase()) || null;
}

function isNameInPartners(name) {
    return !!findPartnerByName(name);
}

function getNamesByGender(gender) {
    const partners = getPartnersByGender(gender);
    return partners.map(p => p.name);
}

module.exports = { getPartnersByGender, findPartnerByName, isNameInPartners, getNamesByGender };
