/**
 * SYNTHETIC / DEMO DATASET
 * Clearly marked as synthetic simulation for Hackatopia 2026.
 * Contains no real personal identifiable information, banks, or external payment rails.
 */

export const INITIAL_ACCOUNTS = [
  {
    id: 'Victim-001',
    name: 'Devendra K. (Reporting Victim)',
    accountType: 'Savings Account',
    accountAgeDays: 1420,
    currentBalance: 32400,
    totalIncoming: 95000,
    totalOutgoing: 75000,
    txnCount: 12,
    uniqueSenders: 2,
    uniqueReceivers: 3,
    avgTxnAmount: 25000,
    medianTransferDelayMinutes: 480,
    passThroughRatio: 0.12,
    riskScore: 12,
    riskLevel: 'LOW',
    isVictim: true,
    isMule: false,
    communityId: 'Community #04',
    region: 'Region C',
    status: 'Active',
    riskReasons: [
      'Identified as complainant in Digital Arrest cyber report #NCR-8821',
      'Long-standing account with regular salary credits',
      'Normal consumer activity baseline'
    ],
    timeline: [
      { time: '10:10 AM', description: 'User login from recognized home device IP', severity: 'LOW' },
      { time: '10:15 AM', description: 'Urgent transfer of ₹75,000 to A102 under duress', severity: 'HIGH', relatedTxnId: 'TXN-84921' },
      { time: '10:45 AM', description: 'Fraud complaint registered on National Cyber Portal', severity: 'MEDIUM' }
    ]
  },
  {
    id: 'A102',
    name: 'Aman Deep (Sole Prop / Mule L1)',
    accountType: 'Current / Sole Prop',
    accountAgeDays: 24,
    currentBalance: 1500,
    totalIncoming: 1845000,
    totalOutgoing: 1832000,
    txnCount: 38,
    uniqueSenders: 23,
    uniqueReceivers: 4,
    avgTxnAmount: 74200,
    medianTransferDelayMinutes: 3.2,
    passThroughRatio: 0.94,
    riskScore: 91,
    riskLevel: 'CRITICAL',
    isVictim: false,
    isMule: true,
    communityId: 'Community #17',
    region: 'Region A',
    status: 'Flagged for Review',
    riskReasons: [
      'Received funds from 23 unique unrelated accounts',
      '94% of incoming funds moved onward within minutes',
      'Median transfer delay: 3.2 minutes (extreme velocity)',
      'Connected to 4 suspicious accounts in syndicate',
      'Participates in suspicious community #17'
    ],
    timeline: [
      { time: '09:42 AM', description: 'Dormant account balance of ₹800', severity: 'LOW' },
      { time: '10:15 AM', description: 'Received ₹75,000 from Victim-001', severity: 'HIGH', relatedTxnId: 'TXN-84921' },
      { time: '10:18 AM', description: 'Rapid onward transfer of ₹73,500 to B552 (3 min delay)', severity: 'CRITICAL', relatedTxnId: 'TXN-84922' },
      { time: '10:23 AM', description: 'Algorithmic Risk Score spiked to 91 (Critical Mule)', severity: 'CRITICAL' },
      { time: '10:25 AM', description: 'Automated Alert ALT-1091 generated for investigator review', severity: 'HIGH' }
    ]
  },
  {
    id: 'B552',
    name: 'Bharat Logix Traders (Mule L2)',
    accountType: 'Current Account',
    accountAgeDays: 41,
    currentBalance: 3200,
    totalIncoming: 3420000,
    totalOutgoing: 3380000,
    txnCount: 45,
    uniqueSenders: 14,
    uniqueReceivers: 5,
    avgTxnAmount: 71500,
    medianTransferDelayMinutes: 2.8,
    passThroughRatio: 0.96,
    riskScore: 78,
    riskLevel: 'HIGH',
    isVictim: false,
    isMule: true,
    communityId: 'Community #17',
    region: 'Region A',
    status: 'Investigating',
    riskReasons: [
      'Multiple unrelated incoming accounts (14 senders)',
      'Rapid pass-through within 2.8 minutes of receipt',
      'High similarity in incoming/outgoing structuring amounts',
      'Direct link to primary mule A102'
    ],
    timeline: [
      { time: '09:50 AM', description: 'Rapid micro-credits received from 3 different sources', severity: 'MEDIUM' },
      { time: '10:18 AM', description: 'Received ₹73,500 from A102', severity: 'CRITICAL', relatedTxnId: 'TXN-84922' },
      { time: '10:20 AM', description: 'Transferred ₹70,000 to C771 (2 min delay)', severity: 'CRITICAL', relatedTxnId: 'TXN-84923' },
      { time: '10:22 AM', description: 'Risk score elevated to 78 (High Risk)', severity: 'HIGH' }
    ]
  },
  {
    id: 'C771',
    name: 'Chirag Tech Solutions (Mule L3)',
    accountType: 'Current Account',
    accountAgeDays: 52,
    currentBalance: 2800,
    totalIncoming: 2150000,
    totalOutgoing: 2110000,
    txnCount: 29,
    uniqueSenders: 9,
    uniqueReceivers: 3,
    avgTxnAmount: 69800,
    medianTransferDelayMinutes: 4.1,
    passThroughRatio: 0.95,
    riskScore: 69,
    riskLevel: 'HIGH',
    isVictim: false,
    isMule: true,
    communityId: 'Community #17',
    region: 'Region B',
    status: 'Under Investigation',
    riskReasons: [
      'Rapid onward transfer detected (4.1 min median delay)',
      '95% pass-through ratio with low residual balance',
      'Third hop downstream from scam entry point',
      'Member of Mule Syndicate Community #17'
    ],
    timeline: [
      { time: '10:20 AM', description: 'Received ₹70,000 from B552', severity: 'HIGH', relatedTxnId: 'TXN-84923' },
      { time: '10:24 AM', description: 'Transferred ₹68,000 to D334 (4 min delay)', severity: 'HIGH', relatedTxnId: 'TXN-84924' },
      { time: '10:26 AM', description: 'Freeze simulation triggered by investigator', severity: 'MEDIUM' }
    ]
  },
  {
    id: 'D334',
    name: 'Dhanraj Bullion Trading (Cashout / OTC L4)',
    accountType: 'Escrow / Merchant',
    accountAgeDays: 85,
    currentBalance: 12400,
    totalIncoming: 5800000,
    totalOutgoing: 5690000,
    txnCount: 72,
    uniqueSenders: 32,
    uniqueReceivers: 12,
    avgTxnAmount: 68500,
    medianTransferDelayMinutes: 5.5,
    passThroughRatio: 0.97,
    riskScore: 62,
    riskLevel: 'MEDIUM',
    isVictim: false,
    isMule: true,
    communityId: 'Community #17',
    region: 'Region B',
    status: 'Active',
    riskReasons: [
      'Unusual transaction frequency for merchant category',
      'Repeated incoming hops from mule accounts C771 and B552',
      'Acts as terminal cashout / physical bullion off-ramp'
    ],
    timeline: [
      { time: '10:00 AM', description: 'Batch settlement of ₹1.2 Lakh processed', severity: 'LOW' },
      { time: '10:24 AM', description: 'Received ₹68,000 from C771', severity: 'HIGH', relatedTxnId: 'TXN-84924' },
      { time: '10:30 AM', description: 'Outgoing withdrawal queue initialized for ₹65,000', severity: 'HIGH' }
    ]
  },
  {
    id: 'E889',
    name: 'Everest Remittance Hub (Predicted Next Hop)',
    accountType: 'Virtual Escrow',
    accountAgeDays: 18,
    currentBalance: 9500,
    totalIncoming: 4200000,
    totalOutgoing: 4120000,
    txnCount: 51,
    uniqueSenders: 19,
    uniqueReceivers: 6,
    avgTxnAmount: 65000,
    medianTransferDelayMinutes: 3.8,
    passThroughRatio: 0.96,
    riskScore: 84,
    riskLevel: 'CRITICAL',
    isVictim: false,
    isMule: true,
    communityId: 'Community #17',
    region: 'Region A',
    status: 'Flagged for Review',
    riskReasons: [
      'Frequent recipient of layering funds from Community #17',
      'Pass-through ratio 96% with rapid off-shore remittance links',
      'Identified as primary candidate for next hop from D334'
    ],
    timeline: [
      { time: '09:15 AM', description: 'Account opened via instant video KYC (high risk flags)', severity: 'HIGH' },
      { time: '10:25 AM', description: 'Flagged by Next-Hop Predictive Simulation engine', severity: 'HIGH' }
    ]
  },
  {
    id: 'F221',
    name: 'Falak Agro Products Pvt Ltd',
    accountType: 'Corporate Current',
    accountAgeDays: 920,
    currentBalance: 415000,
    totalIncoming: 8200000,
    totalOutgoing: 6100000,
    txnCount: 68,
    uniqueSenders: 8,
    uniqueReceivers: 14,
    avgTxnAmount: 120000,
    medianTransferDelayMinutes: 1440,
    passThroughRatio: 0.42,
    riskScore: 18,
    riskLevel: 'LOW',
    isVictim: false,
    isMule: false,
    communityId: 'Community #04',
    region: 'Region C',
    status: 'Active',
    riskReasons: [
      'Established corporate account with high balance retention',
      'Low velocity transfers following standard invoice cycles (24-48 hrs)',
      'Verified GST and corporate tax filings'
    ],
    timeline: [
      { time: '09:00 AM', description: 'Vendor invoice payment of ₹1,20,000 executed', severity: 'LOW' }
    ]
  },
  {
    id: 'G443',
    name: 'Global Enterprise Corp (Structuring Ring)',
    accountType: 'Current Account',
    accountAgeDays: 62,
    currentBalance: 8400,
    totalIncoming: 3800000,
    totalOutgoing: 3720000,
    txnCount: 64,
    uniqueSenders: 18,
    uniqueReceivers: 7,
    avgTxnAmount: 49500,
    medianTransferDelayMinutes: 5.1,
    passThroughRatio: 0.93,
    riskScore: 82,
    riskLevel: 'CRITICAL',
    isVictim: false,
    isMule: true,
    communityId: 'Community #09',
    region: 'Region B',
    status: 'Escalated',
    riskReasons: [
      'Structuring / splitting pattern (repeated ₹49,500 transfers just below ₹50k KYC limit)',
      'High velocity pass-through to foreign travel cards',
      'Direct links to secondary syndicate Community #09'
    ],
    timeline: [
      { time: '10:05 AM', description: 'Three identical ₹49,500 credits within 7 minutes', severity: 'CRITICAL' },
      { time: '10:14 AM', description: 'Immediate fan-out to 3 prepaid cards', severity: 'HIGH' }
    ]
  },
  {
    id: 'H667',
    name: 'Horizon Freight Exports',
    accountType: 'Corporate Current',
    accountAgeDays: 780,
    currentBalance: 320000,
    totalIncoming: 4900000,
    totalOutgoing: 4200000,
    txnCount: 42,
    uniqueSenders: 6,
    uniqueReceivers: 9,
    avgTxnAmount: 95000,
    medianTransferDelayMinutes: 2880,
    passThroughRatio: 0.38,
    riskScore: 22,
    riskLevel: 'LOW',
    isVictim: false,
    isMule: false,
    communityId: 'Community #04',
    region: 'Region D',
    status: 'Active',
    riskReasons: [
      'Regular logistics vendor settlements',
      'Stable operational working balance',
      'No anomalous velocity spikes'
    ],
    timeline: [
      { time: 'Yesterday', description: 'Customs port clearance payment of ₹95,000', severity: 'LOW' }
    ]
  },
  {
    id: 'N101',
    name: 'Navin Supermart Retail',
    accountType: 'Merchant Current',
    accountAgeDays: 640,
    currentBalance: 88000,
    totalIncoming: 1900000,
    totalOutgoing: 1400000,
    txnCount: 88,
    uniqueSenders: 45,
    uniqueReceivers: 8,
    avgTxnAmount: 2100,
    medianTransferDelayMinutes: 720,
    passThroughRatio: 0.31,
    riskScore: 16,
    riskLevel: 'LOW',
    isVictim: false,
    isMule: false,
    communityId: 'Community #04',
    region: 'Region D',
    status: 'Active',
    riskReasons: [
      'Typical retail merchant incoming POS flow',
      'End of day batch supplier payouts'
    ],
    timeline: []
  },
  {
    id: 'N102',
    name: 'Apex Digital Print Solutions',
    accountType: 'Current Account',
    accountAgeDays: 320,
    currentBalance: 42000,
    totalIncoming: 850000,
    totalOutgoing: 690000,
    txnCount: 28,
    uniqueSenders: 11,
    uniqueReceivers: 7,
    avgTxnAmount: 18500,
    medianTransferDelayMinutes: 1200,
    passThroughRatio: 0.45,
    riskScore: 24,
    riskLevel: 'LOW',
    isVictim: false,
    isMule: false,
    communityId: 'Community #04',
    region: 'Region C',
    status: 'Active',
    riskReasons: [
      'Consistent B2B print invoice settlements',
      'Normal operational profile'
    ],
    timeline: []
  },
  {
    id: 'M901',
    name: 'Kiran Cyber Hub (Micro Mule)',
    accountType: 'Savings Account',
    accountAgeDays: 19,
    currentBalance: 900,
    totalIncoming: 620000,
    totalOutgoing: 615000,
    txnCount: 22,
    uniqueSenders: 12,
    uniqueReceivers: 2,
    avgTxnAmount: 32000,
    medianTransferDelayMinutes: 4.5,
    passThroughRatio: 0.98,
    riskScore: 76,
    riskLevel: 'HIGH',
    isVictim: false,
    isMule: true,
    communityId: 'Community #09',
    region: 'Region B',
    status: 'Investigating',
    riskReasons: [
      'High pass-through ratio 98% with minimal balance retained',
      'Rapid redirection to crypto P2P aggregators',
      'Affiliated with structuring syndicate Community #09'
    ],
    timeline: []
  }
];

export const INITIAL_TRANSACTIONS = [
  // Flagship Multi-Hop Scam Trail (Digital Arrest Scam)
  {
    id: 'TXN-84921',
    fromAccount: 'Victim-001',
    toAccount: 'A102',
    amount: 75000,
    timestamp: '2026-10-08 10:15 AM',
    timeEpoch: 1791434700,
    channel: 'IMPS',
    riskLevel: 'CRITICAL',
    status: 'Completed',
    notes: 'Reported scam debit: Digital arrest threat payment into mule layer 1',
    isScamTrail: true
  },
  {
    id: 'TXN-84922',
    fromAccount: 'A102',
    toAccount: 'B552',
    amount: 73500,
    timestamp: '2026-10-08 10:18 AM',
    timeEpoch: 1791434880,
    channel: 'IMPS',
    riskLevel: 'CRITICAL',
    status: 'Completed',
    notes: 'Hop 2: 3-minute delay pass-through (₹1,500 mule commission retained)',
    isScamTrail: true
  },
  {
    id: 'TXN-84923',
    fromAccount: 'B552',
    toAccount: 'C771',
    amount: 70000,
    timestamp: '2026-10-08 10:20 AM',
    timeEpoch: 1791435000,
    channel: 'IMPS',
    riskLevel: 'CRITICAL',
    status: 'Completed',
    notes: 'Hop 3: 2-minute delay onward transfer to tech proxy account',
    isScamTrail: true
  },
  {
    id: 'TXN-84924',
    fromAccount: 'C771',
    toAccount: 'D334',
    amount: 68000,
    timestamp: '2026-10-08 10:24 AM',
    timeEpoch: 1791435240,
    channel: 'RTGS',
    riskLevel: 'HIGH',
    status: 'Completed',
    notes: 'Hop 4: 4-minute delay transfer to Bullion merchant off-ramp',
    isScamTrail: true
  },
  {
    id: 'TXN-84925',
    fromAccount: 'D334',
    toAccount: 'E889',
    amount: 65500,
    timestamp: '2026-10-08 10:28 AM',
    timeEpoch: 1791435480,
    channel: 'NEFT',
    riskLevel: 'HIGH',
    status: 'Completed',
    notes: 'Hop 5: Subsequent transfer to virtual remittance escrow',
    isScamTrail: true
  },
  // Additional Syndicate Transactions (Community #17 & #09)
  {
    id: 'TXN-91024',
    fromAccount: 'G443',
    toAccount: 'M901',
    amount: 49500,
    timestamp: '2026-10-08 10:05 AM',
    timeEpoch: 1791434100,
    channel: 'IMPS',
    riskLevel: 'CRITICAL',
    status: 'Completed',
    notes: 'Structuring split transaction just below ₹50k KYC threshold',
    isScamTrail: false
  },
  {
    id: 'TXN-91025',
    fromAccount: 'G443',
    toAccount: 'M901',
    amount: 49500,
    timestamp: '2026-10-08 10:09 AM',
    timeEpoch: 1791434340,
    channel: 'IMPS',
    riskLevel: 'CRITICAL',
    status: 'Completed',
    notes: 'Sequential structuring tranche 2',
    isScamTrail: false
  },
  {
    id: 'TXN-91030',
    fromAccount: 'A102',
    toAccount: 'E889',
    amount: 110000,
    timestamp: '2026-10-08 09:30 AM',
    timeEpoch: 1791432000,
    channel: 'RTGS',
    riskLevel: 'HIGH',
    status: 'Completed',
    notes: 'Prior cross-link between mule nodes A102 and E889',
    isScamTrail: false
  },
  {
    id: 'TXN-91035',
    fromAccount: 'B552',
    toAccount: 'G443',
    amount: 85000,
    timestamp: '2026-10-08 09:45 AM',
    timeEpoch: 1791432900,
    channel: 'IMPS',
    riskLevel: 'HIGH',
    status: 'Completed',
    notes: 'Syndicate cross-cluster transfer (Community #17 to #09)',
    isScamTrail: false
  },
  // Legitimate Normal Commercial Transactions
  {
    id: 'TXN-70011',
    fromAccount: 'F221',
    toAccount: 'H667',
    amount: 120000,
    timestamp: '2026-10-08 09:00 AM',
    timeEpoch: 1791430200,
    channel: 'NEFT',
    riskLevel: 'LOW',
    status: 'Settled',
    notes: 'Commercial agro freight invoice settlement (Normal)',
    isScamTrail: false
  },
  {
    id: 'TXN-70012',
    fromAccount: 'H667',
    toAccount: 'N101',
    amount: 45000,
    timestamp: '2026-10-08 08:30 AM',
    timeEpoch: 1791428400,
    channel: 'NEFT',
    riskLevel: 'LOW',
    status: 'Settled',
    notes: 'Local supplies delivery reconciliation',
    isScamTrail: false
  },
  {
    id: 'TXN-70013',
    fromAccount: 'N101',
    toAccount: 'N102',
    amount: 14500,
    timestamp: '2026-10-08 08:15 AM',
    timeEpoch: 1791427500,
    channel: 'IMPS',
    riskLevel: 'LOW',
    status: 'Settled',
    notes: 'Packaging and commercial printing invoice',
    isScamTrail: false
  },
  {
    id: 'TXN-70014',
    fromAccount: 'F221',
    toAccount: 'N102',
    amount: 28000,
    timestamp: '2026-10-08 07:45 AM',
    timeEpoch: 1791425700,
    channel: 'NEFT',
    riskLevel: 'LOW',
    status: 'Settled',
    notes: 'Marketing brochure bulk order',
    isScamTrail: false
  }
];

export const INITIAL_RISK_ALERTS = [
  {
    id: 'ALT-1091',
    accountId: 'A102',
    riskScore: 91,
    alertType: 'High transaction velocity',
    severity: 'CRITICAL',
    detectedTime: '12 mins ago',
    status: 'New',
    assignedAnalyst: 'R. Sharma (L2 Lead)',
    description: 'High-velocity pass-through behaviour detected: ₹75,000 in, ₹73,500 transferred onward in 3 mins.'
  },
  {
    id: 'ALT-1082',
    accountId: 'B552',
    riskScore: 78,
    alertType: 'Multiple unrelated senders',
    severity: 'HIGH',
    detectedTime: '15 mins ago',
    status: 'Investigating',
    assignedAnalyst: 'S. Iyer (AML Specialist)',
    description: 'Multiple unrelated incoming accounts (14 unique senders within 48h) with negligible balance retention.'
  },
  {
    id: 'ALT-1077',
    accountId: 'C771',
    riskScore: 69,
    alertType: 'Rapid onward transfer',
    severity: 'HIGH',
    detectedTime: '21 mins ago',
    status: 'Investigating',
    assignedAnalyst: 'R. Sharma (L2 Lead)',
    description: 'Rapid onward transfer detected: ₹70,000 forwarded to bullion merchant D334 within 4 minutes.'
  },
  {
    id: 'ALT-1065',
    accountId: 'D334',
    riskScore: 62,
    alertType: 'Unusual transaction frequency',
    severity: 'MEDIUM',
    detectedTime: '34 mins ago',
    status: 'Investigating',
    assignedAnalyst: 'V. Nair (Cyber Fraud)',
    description: 'Unusual transaction frequency spike: 72 transactions in 3 days for recently registered escrow profile.'
  },
  {
    id: 'ALT-1054',
    accountId: 'G443',
    riskScore: 82,
    alertType: 'Structuring / splitting pattern',
    severity: 'CRITICAL',
    detectedTime: '45 mins ago',
    status: 'Escalated',
    assignedAnalyst: 'R. Sharma (L2 Lead)',
    description: 'Structuring pattern: Repeated transfers of ₹49,500 deliberately routed below ₹50k threshold.'
  },
  {
    id: 'ALT-1049',
    accountId: 'E889',
    riskScore: 84,
    alertType: 'Suspicious community membership',
    severity: 'CRITICAL',
    detectedTime: '55 mins ago',
    status: 'New',
    assignedAnalyst: 'Unassigned',
    description: 'Syndicate nexus: Interlocking transfer graph with 5 identified mule hubs in Community #17.'
  }
];

export const INITIAL_CASES = [
  {
    id: 'CASE-2026-0142',
    title: 'Suspected Multi-Hop Digital Arrest Scam',
    priority: 'Critical',
    assignedAnalyst: 'Agent R. Sharma (L2 Cyber Unit)',
    createdAt: '2026-10-08 10:28 AM',
    status: 'Investigating',
    suspiciousAccounts: ['A102', 'B552', 'C771', 'D334'],
    transactions: ['TXN-84921', 'TXN-84922', 'TXN-84923', 'TXN-84924'],
    amountUnderInvestigation: 75000,
    summary: 'Complainant reported intimidation scam (fake CBI digital arrest). Funds routed through 4 mule accounts in under 9 minutes.',
    evidenceList: [
      { id: 'EV-101', type: 'account', label: 'Mule Layer 1 (A102)', detail: 'Risk Score 91 | 94% Pass-through | 3.2m delay', timestamp: '10:28 AM' },
      { id: 'EV-102', type: 'transaction', label: 'Primary Debit TXN-84921', detail: '₹75,000 IMPS from Victim-001', timestamp: '10:29 AM' },
      { id: 'EV-103', type: 'community', label: 'Community #17 Cluster', detail: 'High-Velocity Mule Syndicate (8 linked accounts)', timestamp: '10:31 AM' },
      { id: 'EV-104', type: 'prediction', label: 'Predicted Hop E889', detail: '82% confidence next hop before cashout', timestamp: '10:34 AM' }
    ]
  },
  {
    id: 'CASE-2026-0098',
    title: 'Structuring & Micro-Splitting Investment Fraud Ring',
    priority: 'High',
    assignedAnalyst: 'Agent S. Iyer (AML Specialist)',
    createdAt: '2026-10-08 09:15 AM',
    status: 'Open',
    suspiciousAccounts: ['G443', 'M901'],
    transactions: ['TXN-91024', 'TXN-91025'],
    amountUnderInvestigation: 99000,
    summary: 'Sub-₹50k repetitive deposits funneling into crypto P2P aggregators across Region B.',
    evidenceList: [
      { id: 'EV-201', type: 'account', label: 'G443', detail: 'Risk Score 82 | Structuring Pattern', timestamp: '09:20 AM' },
      { id: 'EV-202', type: 'transaction', label: 'TXN-91024', detail: '₹49,500 split transfer', timestamp: '09:22 AM' }
    ]
  }
];

export const SUSPICIOUS_COMMUNITIES = [
  {
    id: 'Community #17',
    name: 'High-Velocity Mule Syndicate',
    accountsCount: 8,
    transactionsCount: 24,
    totalVolume: 14850000, // ₹1.48 Cr
    highRiskAccounts: 6,
    avgTransferDelay: 3.1, // mins
    mostSuspiciousAccount: 'A102',
    highestRiskScore: 91,
    accounts: ['A102', 'B552', 'C771', 'D334', 'E889'],
    riskLevel: 'CRITICAL',
    description: 'Tightly coupled money routing ring moving stolen scam deposits through rapid sequential IMPS hops before bullion conversion.'
  },
  {
    id: 'Community #09',
    name: 'Structuring & Micro-Splitting Ring',
    accountsCount: 5,
    transactionsCount: 16,
    totalVolume: 3400000, // ₹34 Lakh
    highRiskAccounts: 4,
    avgTransferDelay: 6.4,
    mostSuspiciousAccount: 'G443',
    highestRiskScore: 82,
    accounts: ['G443', 'M901'],
    riskLevel: 'HIGH',
    description: 'Split-amount layering ring operating systematically beneath statutory transaction reporting thresholds.'
  },
  {
    id: 'Community #04',
    name: 'Commercial Trade Merchants (Baseline)',
    accountsCount: 9,
    transactionsCount: 45,
    totalVolume: 21500000, // ₹2.15 Cr
    highRiskAccounts: 0,
    avgTransferDelay: 1440, // 24 hrs
    mostSuspiciousAccount: 'N102',
    highestRiskScore: 24,
    accounts: ['F221', 'H667', 'N101', 'N102'],
    riskLevel: 'LOW',
    description: 'Legitimate business transactions adhering to standard invoice reconciliation terms.'
  }
];

export const SYNTHETIC_REGIONS = [
  { id: 'Region A', name: 'Region A (North Corridor)', suspiciousAccounts: 4, highRiskTxns: 14, totalAccounts: 120, anchorCommunity: 'Community #17' },
  { id: 'Region B', name: 'Region B (Metro Fin Hub)', suspiciousAccounts: 5, highRiskTxns: 19, totalAccounts: 240, anchorCommunity: 'Community #09' },
  { id: 'Region C', name: 'Region C (Coastal Maritime)', suspiciousAccounts: 1, highRiskTxns: 3, totalAccounts: 90, anchorCommunity: 'Community #04' },
  { id: 'Region D', name: 'Region D (Central Distribution)', suspiciousAccounts: 0, highRiskTxns: 0, totalAccounts: 180, anchorCommunity: 'Community #04' }
];

export const RECENT_ACTIVITIES = [
  {
    id: 'ACT-1',
    time: '2 mins ago',
    type: 'cluster',
    description: 'New suspicious cluster Community #17 identified with 6 linked mule accounts',
    severity: 'CRITICAL',
    icon: 'Network'
  },
  {
    id: 'ACT-2',
    time: '5 mins ago',
    type: 'trace',
    description: 'Money trail traced for TXN-84921 across 4 rapid hops (₹75,000)',
    severity: 'HIGH',
    icon: 'GitBranch'
  },
  {
    id: 'ACT-3',
    time: '9 mins ago',
    type: 'risk',
    description: 'Account A102 risk score updated to 91 (Extreme velocity pass-through)',
    severity: 'CRITICAL',
    icon: 'ShieldAlert'
  },
  {
    id: 'ACT-4',
    time: '14 mins ago',
    type: 'anomaly',
    description: 'High velocity pattern detected: Median delay 3.2 minutes between hops',
    severity: 'HIGH',
    icon: 'Zap'
  },
  {
    id: 'ACT-5',
    time: '22 mins ago',
    type: 'prediction',
    description: 'Next-hop prediction simulated for C771 → D334 (82% confidence)',
    severity: 'MEDIUM',
    icon: 'Compass'
  },
  {
    id: 'ACT-6',
    time: '35 mins ago',
    type: 'case',
    description: 'Investigation case CASE-2026-0142 created by Analyst R. Sharma',
    severity: 'LOW',
    icon: 'Briefcase'
  }
];

export const PREDEFINED_SCENARIOS = {
  SCENARIO_3_MULTI_HOP: {
    id: 'scenario-3',
    name: 'Scenario 3: Multi-Hop Scam Network (Flagship)',
    description: 'Full Digital Arrest scam simulation: Victim funds routed across 4 rapid mule hops within 9 minutes, with next-hop prediction and freeze simulator.',
    accounts: INITIAL_ACCOUNTS,
    transactions: INITIAL_TRANSACTIONS,
    alerts: INITIAL_RISK_ALERTS,
    defaultTraceTxnId: 'TXN-84921',
    defaultInvestigateAccountId: 'A102'
  },
  SCENARIO_2_SINGLE_MULE: {
    id: 'scenario-2',
    name: 'Scenario 2: Single Mule Account',
    description: 'Isolated mule pattern where a newly registered account receives a single large transfer and drains it via ATM / cash withdrawal.',
    accounts: INITIAL_ACCOUNTS.map(a => {
      if (a.id === 'A102') return { ...a, riskScore: 88, riskLevel: 'CRITICAL', uniqueReceivers: 1, passThroughRatio: 0.99 };
      if (['B552', 'C771', 'D334', 'E889'].includes(a.id)) return { ...a, riskScore: 35, riskLevel: 'LOW', isMule: false };
      return a;
    }),
    transactions: INITIAL_TRANSACTIONS.filter(t => ['TXN-84921', 'TXN-70011', 'TXN-70012', 'TXN-70013'].includes(t.id)),
    alerts: INITIAL_RISK_ALERTS.filter(a => a.accountId === 'A102'),
    defaultTraceTxnId: 'TXN-84921',
    defaultInvestigateAccountId: 'A102'
  },
  SCENARIO_1_NORMAL: {
    id: 'scenario-1',
    name: 'Scenario 1: Normal Banking Activity',
    description: 'Clean commercial banking environment with standard B2B invoice settlements, healthy balance retention, and no rapid pass-through anomalies.',
    accounts: INITIAL_ACCOUNTS.map(a => ({
      ...a,
      riskScore: Math.min(25, a.riskScore > 30 ? 20 : a.riskScore),
      riskLevel: 'LOW',
      isMule: false,
      passThroughRatio: 0.35,
      medianTransferDelayMinutes: 720
    })),
    transactions: INITIAL_TRANSACTIONS.filter(t => !t.isScamTrail),
    alerts: [],
    defaultTraceTxnId: 'TXN-70011',
    defaultInvestigateAccountId: 'F221'
  }
};
