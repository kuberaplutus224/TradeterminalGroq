/**
 * Stock Market Calendar Utility
 * Based on NYSE/NASDAQ Holiday Schedule
 */

const holidays = [
    '2026-01-01', // New Year's Day
    '2026-01-19', // Martin Luther King, Jr. Day
    '2026-02-16', // Washington's Birthday (Presidents' Day)
    '2026-04-03', // Good Friday
    '2026-05-25', // Memorial Day
    '2026-06-19', // Juneteenth
    '2026-07-03', // Independence Day (Observed)
    '2026-09-07', // Labor Day
    '2026-11-26', // Thanksgiving Day
    '2026-12-25', // Christmas Day
];

export const isMarketClosed = (dateString: string): { closed: boolean; reason?: string } => {
    const date = new Date(dateString);

    // 1. Weekend Check (0 = Sunday, 6 = Saturday)
    const day = date.getUTCDay();
    if (day === 0 || day === 6) {
        return { closed: true, reason: 'MARKET CLOSED: WEEKEND PROTOCOL' };
    }

    // 2. Holiday Check
    if (holidays.includes(dateString)) {
        return { closed: true, reason: 'MARKET CLOSED: EXCHANGE HOLIDAY' };
    }

    return { closed: false };
};
