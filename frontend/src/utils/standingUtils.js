export const DIVISIONS = [
    "3 Year Old Division",
    "4 Year Old Division",
    "5 Year Old Division",
    "Snack Pack Division",
];

export const POINTS_BY_PLACEMENT = { 1: 13, 2: 10, 3: 8 };

export const standingsSort = (a, b) => {
    // points DESC
    if (b.points !== a.points) return b.points - a.points;

    // tie-breakers DESC
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (b.seconds !== a.seconds) return b.seconds - a.seconds;
    if (b.thirds !== a.thirds) return b.thirds - a.thirds;
    if (b.races !== a.races) return b.races - a.races;

    // stable final tie-breaker (ASC)
    return String(a.name || "").localeCompare(String(b.name || ""), undefined, { sensitivity: "base" });
};

/**
 * Accepts the FLAT /results payload (each row includes division, racerName, placement)
 * Returns: { [division]: [{ name, division, points, races, wins, seconds, thirds }] }
 */
export const buildStandingsFromFlatResults = (flatResults = []) => {
    const totals = {};

    for (const row of flatResults) {
        const division = row.division;
        const name = row.racerName;

        if (!division || !name) continue;

        const placement = Number(row.placement);
        const pts = POINTS_BY_PLACEMENT[placement] ?? 1;

        const key = `${division}|||${name}`;

        if (!totals[key]) {
            totals[key] = {
                name,
                division,
                points: 0,
                races: 0,
                wins: 0,
                seconds: 0,
                thirds: 0,
            };
        }

        totals[key].points += pts;
        totals[key].races += 1;
        if (placement === 1) totals[key].wins += 1;
        if (placement === 2) totals[key].seconds += 1;
        if (placement === 3) totals[key].thirds += 1;
    }

    const out = {};
    for (const div of DIVISIONS) {
        const racers = Object.values(totals).filter((r) => r.division === div);
        out[div] = racers.sort(standingsSort);
    }

    // include any unexpected/new divisions too (optional)
    Object.values(totals).forEach((r) => {
        if (!out[r.division]) out[r.division] = [];
    });
    Object.keys(out).forEach((div) => {
        out[div] = out[div].sort(standingsSort);
    });

    return out;
};