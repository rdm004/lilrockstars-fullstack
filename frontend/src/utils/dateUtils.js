// src/utils/dateUtils.js

// Format: 14 March 2026
export const formatRaceDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    if (isNaN(date)) return "";

    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear();

    return `${day} ${month} ${year}`;
};