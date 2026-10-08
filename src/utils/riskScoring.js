/**
 * Explainable Deterministic Fraud & Mule Risk Scoring Engine
 * Designed for prototype transparency; easily pluggable into future Python backend.
 */

export function calculateAccountRisk(account, graphContext = {}) {
  const {
    uniqueSenders = 1,
    uniqueReceivers = 1,
    medianTransferDelayMinutes = 60,
    passThroughRatio = 0.5,
    txnCount = 5,
    accountAgeDays = 180,
    connectedSuspiciousAccounts = 0,
    communityRisk = 'LOW',
    isVictim = false
  } = account;

  // If flagged as reporting victim, risk is minimal/low
  if (isVictim) {
    return {
      score: 12,
      level: 'LOW',
      breakdown: {
        incomingDiversityScore: 2,
        velocityScore: 2,
        passThroughScore: 2,
        networkScore: 4,
        frequencyScore: 2
      },
      reasons: [
        'Account identified as complaining victim',
        'Single outward fraudulent transaction reported',
        'Normal long-term consumer account profile'
      ]
    };
  }

  // 1. Incoming Diversity Score (0 to 20 pts)
  // Mule accounts often receive rapid deposits from multiple unrelated victims or sub-mules
  let incomingDiversityScore = 0;
  if (uniqueSenders >= 15) incomingDiversityScore = 20;
  else if (uniqueSenders >= 8) incomingDiversityScore = 15;
  else if (uniqueSenders >= 4) incomingDiversityScore = 10;
  else incomingDiversityScore = 3;

  // 2. Velocity Score (0 to 25 pts)
  // Immediate onward transfer delay is a hallmark of digital arrest & investment scams
  let velocityScore = 0;
  if (medianTransferDelayMinutes <= 3.5) velocityScore = 25;
  else if (medianTransferDelayMinutes <= 10) velocityScore = 20;
  else if (medianTransferDelayMinutes <= 30) velocityScore = 14;
  else if (medianTransferDelayMinutes <= 120) velocityScore = 8;
  else velocityScore = 3;

  // 3. Pass-Through Ratio Score (0 to 25 pts)
  // Mules do not keep money. They immediately drain 90%+ of incoming funds
  let passThroughScore = 0;
  if (passThroughRatio >= 0.92) passThroughScore = 25;
  else if (passThroughRatio >= 0.80) passThroughScore = 18;
  else if (passThroughRatio >= 0.65) passThroughScore = 10;
  else passThroughScore = 4;

  // 4. Network & Community Proximity Score (0 to 20 pts)
  // Connections to flagged mules or membership in known syndicate clusters
  let networkScore = 0;
  if (connectedSuspiciousAccounts >= 4 || communityRisk === 'CRITICAL') networkScore = 20;
  else if (connectedSuspiciousAccounts >= 2 || communityRisk === 'HIGH') networkScore = 15;
  else if (connectedSuspiciousAccounts >= 1 || communityRisk === 'MEDIUM') networkScore = 10;
  else networkScore = 2;

  // 5. Frequency Spike vs Account Age Score (0 to 10 pts)
  // Brand new accounts (< 60 days) with abnormal transaction bursts
  let frequencyScore = 0;
  const isNewAccount = accountAgeDays < 60;
  const isHighVelocity = txnCount > 20;
  if (isNewAccount && isHighVelocity) frequencyScore = 10;
  else if (isHighVelocity) frequencyScore = 7;
  else if (isNewAccount) frequencyScore = 5;
  else frequencyScore = 2;

  const rawScore = incomingDiversityScore + velocityScore + passThroughScore + networkScore + frequencyScore;
  const score = Math.min(100, Math.max(0, rawScore));

  let level = 'LOW';
  if (score >= 80) level = 'CRITICAL';
  else if (score >= 65) level = 'HIGH';
  else if (score >= 40) level = 'MEDIUM';
  else level = 'LOW';

  // Generate transparent human-interpretable fraud analyst reasons
  const reasons = [];
  if (uniqueSenders >= 8) {
    reasons.push(`Received funds from ${uniqueSenders} unique unrelated accounts`);
  }
  if (passThroughRatio >= 0.85) {
    reasons.push(`${Math.round(passThroughRatio * 100)}% of incoming funds moved onward within minutes`);
  }
  if (medianTransferDelayMinutes <= 10) {
    reasons.push(`Median transfer delay: ${medianTransferDelayMinutes.toFixed(1)} minutes (extreme velocity)`);
  }
  if (connectedSuspiciousAccounts > 0) {
    reasons.push(`Direct transaction links to ${connectedSuspiciousAccounts} flagged suspicious accounts`);
  }
  if (communityRisk === 'CRITICAL' || communityRisk === 'HIGH') {
    reasons.push(`Belongs to suspicious community cluster #${account.communityId?.replace('Community #', '') || '17'}`);
  }
  if (isNewAccount && txnCount > 10) {
    reasons.push(`Sudden transaction spike on newly opened account (${accountAgeDays} days old)`);
  }
  if (reasons.length === 0) {
    reasons.push('Regular transaction patterns with steady balance retention');
    reasons.push('Low counterparty diversity and standard business delays');
  }

  return {
    score,
    level,
    breakdown: {
      incomingDiversityScore,
      velocityScore,
      passThroughScore,
      networkScore,
      frequencyScore
    },
    reasons
  };
}
