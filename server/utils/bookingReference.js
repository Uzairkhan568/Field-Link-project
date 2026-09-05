const crypto = require("crypto");

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateBookingReference(createdAt = new Date()) {
    const date = new Date(createdAt);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");

    let suffix = "";
    while (suffix.length < 8) {
        for (const byte of crypto.randomBytes(8)) {
            suffix += ALPHABET[byte % ALPHABET.length];
            if (suffix.length === 8) break;
        }
    }

    return `WEF-${year}${month}${day}-${suffix}`;
}

module.exports = { generateBookingReference };
