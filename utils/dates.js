// Dates are stored and compared as "YYYY-MM-DD" strings. Plain string comparison
// then gives the right order, and it avoids time zone shifts.
const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

const pad = (n) => String(n).padStart(2, "0");

const keyFrom = (year, month, day) => `${year}-${pad(month)}-${pad(day)}`;

const isDateKey = (value) => {
    if (typeof value !== "string" || !DATE_KEY.test(value)) return false;
    const [y, m, d] = value.split("-").map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));
    return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
};

const todayKey = () => {
    const now = new Date();
    return keyFrom(now.getFullYear(), now.getMonth() + 1, now.getDate());
};

// Number of nights between two date keys (check-in to check-out)
const nightsBetween = (checkIn, checkOut) =>
    Math.round((Date.parse(`${checkOut}T00:00:00Z`) - Date.parse(`${checkIn}T00:00:00Z`)) / 86400000);

module.exports = { keyFrom, isDateKey, todayKey, nightsBetween };
