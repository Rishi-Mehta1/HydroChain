// Mock data for Green Hydrogen Credit System

export const users = [
  {
    id: 1,
    name: "Green Energy Corp",
    role: "producer",
    verified: true,
    totalCredits: 15000,
    email: "contact@greenenergy.com",
    avatar: "https://ui-avatars.com/api/?name=Green+Energy&background=22c55e&color=fff"
  },
  {
    id: 2,
    name: "EcoTransport Ltd",
    role: "buyer",
    verified: true,
    creditsOwned: 5000,
    email: "info@ecotransport.com",
    avatar: "https://ui-avatars.com/api/?name=EcoTransport&background=0ea5e9&color=fff"
  },
  {
    id: 3,
    name: "Regulatory Authority",
    role: "regulator",
    verified: true,
    email: "admin@regulator.gov",
    avatar: "https://ui-avatars.com/api/?name=Regulatory&background=8b5cf6&color=fff"
  }
];

export const credits = [
  {
    id: "CR001",
    issuer: "Green Energy Corp",
    issuerId: 1,
    amount: 1000,
    status: "active",
    issuedDate: "2024-01-15",
    expiryDate: "2025-01-15",
    certificationBody: "International Green Hydrogen Alliance",
    productionMethod: "Solar Electrolysis",
    co2Reduction: 850,
    price: 45.50
  },
  {
    id: "CR002",
    issuer: "HydroGen Solutions",
    issuerId: 4,
    amount: 2500,
    status: "active",
    issuedDate: "2024-02-01",
    expiryDate: "2025-02-01",
    certificationBody: "Global Hydrogen Certification",
    productionMethod: "Wind Electrolysis",
    co2Reduction: 2125,
    price: 42.00
  },
  {
    id: "CR003",
    issuer: "Clean H2 Industries",
    issuerId: 5,
    amount: 1800,
    status: "retired",
    issuedDate: "2023-11-20",
    expiryDate: "2024-11-20",
    retiredDate: "2024-10-15",
    certificationBody: "EU Green Hydrogen Standard",
    productionMethod: "Hydro Electrolysis",
    co2Reduction: 1530,
    price: 48.75
  },
  {
    id: "CR004",
    issuer: "Green Energy Corp",
    issuerId: 1,
    amount: 3000,
    status: "active",
    issuedDate: "2024-03-10",
    expiryDate: "2025-03-10",
    certificationBody: "International Green Hydrogen Alliance",
    productionMethod: "Solar Electrolysis",
    co2Reduction: 2550,
    price: 44.20
  },
  {
    id: "CR005",
    issuer: "Renewable H2 Co",
    issuerId: 6,
    amount: 500,
    status: "pending",
    issuedDate: "2024-03-15",
    expiryDate: "2025-03-15",
    certificationBody: "Pending Verification",
    productionMethod: "Biomass Gasification",
    co2Reduction: 425,
    price: 40.00
  }
];

export const transactions = [
  {
    id: "TX001",
    type: "issue",
    creditId: "CR001",
    from: null,
    to: "Green Energy Corp",
    amount: 1000,
    date: "2024-01-15T10:30:00Z",
    status: "completed",
    txHash: "0x1a2b3c4d5e6f7g8h9i0j",
    gasUsed: 150000
  },
  {
    id: "TX002",
    type: "transfer",
    creditId: "CR001",
    from: "Green Energy Corp",
    to: "EcoTransport Ltd",
    amount: 250,
    date: "2024-02-20T14:45:00Z",
    status: "completed",
    txHash: "0x2b3c4d5e6f7g8h9i0j1k",
    gasUsed: 120000
  },
  {
    id: "TX003",
    type: "retire",
    creditId: "CR003",
    from: "Clean H2 Industries",
    to: null,
    amount: 1800,
    date: "2024-10-15T09:15:00Z",
    status: "completed",
    txHash: "0x3c4d5e6f7g8h9i0j1k2l",
    gasUsed: 100000
  },
  {
    id: "TX004",
    type: "issue",
    creditId: "CR004",
    from: null,
    to: "Green Energy Corp",
    amount: 3000,
    date: "2024-03-10T11:00:00Z",
    status: "completed",
    txHash: "0x4d5e6f7g8h9i0j1k2l3m",
    gasUsed: 160000
  },
  {
    id: "TX005",
    type: "transfer",
    creditId: "CR002",
    from: "HydroGen Solutions",
    to: "Industrial Consumer Co",
    amount: 500,
    date: "2024-03-12T16:20:00Z",
    status: "completed",
    txHash: "0x5e6f7g8h9i0j1k2l3m4n",
    gasUsed: 110000
  },
  {
    id: "TX006",
    type: "verification",
    creditId: "CR005",
    from: "Regulatory Authority",
    to: "Renewable H2 Co",
    amount: 500,
    date: "2024-03-16T13:30:00Z",
    status: "pending",
    txHash: "0x6f7g8h9i0j1k2l3m4n5o",
    gasUsed: 80000
  }
];

// Chart data
export const producerChartData = [
  { name: 'Jan', credits: 2400 },
  { name: 'Feb', credits: 1398 },
  { name: 'Mar', credits: 4800 },
  { name: 'Apr', credits: 3908 },
  { name: 'May', credits: 4800 },
  { name: 'Jun', credits: 3800 },
];

export const creditStatusData = [
  { name: 'Active', value: 7300, color: '#22c55e' },
  { name: 'Retired', value: 1800, color: '#94a3b8' },
  { name: 'Pending', value: 500, color: '#f59e0b' },
];

export const transactionHistoryData = [
  { date: '2024-01', issued: 1000, transferred: 0, retired: 0 },
  { date: '2024-02', issued: 2500, transferred: 250, retired: 0 },
  { date: '2024-03', issued: 3500, transferred: 750, retired: 0 },
  { date: '2024-10', issued: 0, transferred: 0, retired: 1800 },
];

// Audit logs for regulators
export const auditLogs = [
  {
    id: "AL001",
    timestamp: "2024-03-16T14:30:00Z",
    action: "Credit Verification Request",
    actor: "Renewable H2 Co",
    details: "Submitted 500 credits for verification",
    status: "pending",
    riskLevel: "low"
  },
  {
    id: "AL002",
    timestamp: "2024-03-15T10:15:00Z",
    action: "Large Transfer Detected",
    actor: "HydroGen Solutions",
    details: "Transfer of 2000 credits to multiple buyers",
    status: "reviewed",
    riskLevel: "medium"
  },
  {
    id: "AL003",
    timestamp: "2024-03-14T09:00:00Z",
    action: "Double-spending Prevention",
    actor: "System",
    details: "Prevented duplicate credit issuance attempt",
    status: "resolved",
    riskLevel: "high"
  },
  {
    id: "AL004",
    timestamp: "2024-03-13T16:45:00Z",
    action: "Certificate Verification",
    actor: "Green Energy Corp",
    details: "Verified production certificate for 3000 credits",
    status: "approved",
    riskLevel: "low"
  }
];

// Compliance metrics for buyers
export const complianceMetrics = {
  totalRequired: 10000,
  currentOwned: 5000,
  retiredThisYear: 1800,
  complianceRate: 50,
  deadline: "2024-12-31",
  status: "on-track"
};

// Production facilities for producers
export const productionFacilities = [
  {
    id: "FAC001",
    name: "Solar Farm Alpha",
    location: "California, USA",
    capacity: "500 MW",
    method: "Solar Electrolysis",
    status: "operational",
    efficiency: 85,
    dailyProduction: 120
  },
  {
    id: "FAC002",
    name: "Wind Park Beta",
    location: "Texas, USA",
    capacity: "750 MW",
    method: "Wind Electrolysis",
    status: "operational",
    efficiency: 78,
    dailyProduction: 180
  },
  {
    id: "FAC003",
    name: "Hydro Plant Gamma",
    location: "Oregon, USA",
    capacity: "300 MW",
    method: "Hydro Electrolysis",
    status: "maintenance",
    efficiency: 92,
    dailyProduction: 0
  }
];
