// FIFA World Rankings (April 2025) — used for AI match predictions
export const FIFA_RANKS = {
  'Argentina': 1, 'France': 2, 'Spain': 3, 'England': 4,
  'Portugal': 5, 'Belgium': 6, 'Brazil': 7, 'Netherlands': 8,
  'Germany': 9, 'Colombia': 10, 'Uruguay': 12, 'Croatia': 13,
  'Morocco': 14, 'Japan': 15, 'USA': 16, 'Mexico': 17,
  'Senegal': 18, 'Switzerland': 19, 'Austria': 20, 'Norway': 21,
  'Türkiye': 22, 'Australia': 23, 'South Korea': 24, 'Canada': 25,
  'Algeria': 26, 'Ecuador': 27, 'Sweden': 28, 'Saudi Arabia': 29,
  'Iran': 30, 'Tunisia': 31, 'Ivory Coast': 32, 'Ghana': 33,
  'Panama': 34, 'Scotland': 35, 'Czechia': 36, 'Ukraine': 38,
  'South Africa': 39, 'Cape Verde': 40, 'Jordan': 41, 'Qatar': 42,
  'Bosnia-Herzegovina': 43, 'New Zealand': 44, 'DR Congo': 45,
  'Uzbekistan': 46, 'Iraq': 47, 'Haiti': 48, 'Curaçao': 49,
};

export function stripFlag(name) {
  return name.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '').trim();
}

export function getAIPrediction(homeTeam, awayTeam) {
  const homeName = stripFlag(homeTeam);
  const awayName = stripFlag(awayTeam);
  const homeRank = FIFA_RANKS[homeName] || 50;
  const awayRank = FIFA_RANKS[awayName] || 50;

  // positive diff = home team is ranked better
  const diff = awayRank - homeRank;

  let homeScore, awayScore;
  if      (diff > 25) { homeScore = 3; awayScore = 0; }
  else if (diff > 15) { homeScore = 2; awayScore = 0; }
  else if (diff > 7)  { homeScore = 2; awayScore = 1; }
  else if (diff > 2)  { homeScore = 1; awayScore = 0; }
  else if (diff >= -2){ homeScore = 1; awayScore = 1; }
  else if (diff > -7) { homeScore = 0; awayScore = 1; }
  else if (diff > -15){ homeScore = 1; awayScore = 2; }
  else if (diff > -25){ homeScore = 0; awayScore = 2; }
  else                { homeScore = 0; awayScore = 3; }

  const absDiff = Math.abs(diff);
  const confidence = absDiff > 25 ? 88 : absDiff > 15 ? 76 : absDiff > 7 ? 63 : absDiff > 2 ? 55 : 50;
  const homeWinPct = Math.max(10, Math.min(90, 50 + diff * 1.4));

  return { homeScore, awayScore, confidence, homeWinPct: Math.round(homeWinPct), homeRank, awayRank };
}
