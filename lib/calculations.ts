/**
 * Calculate Fraksi based on stock price
 * Rules:
 * - < 200: Fraksi 1
 * - 200-499: Fraksi 2
 * - 500-1999: Fraksi 5
 * - 2000-4999: Fraksi 10
 * - >= 5000: Fraksi 25
 */
export function getFraksi(harga: number): number {
  if (harga < 200) return 1;
  if (harga >= 200 && harga < 500) return 2;
  if (harga >= 500 && harga < 2000) return 5;
  if (harga >= 2000 && harga < 5000) return 10;
  return 25; // harga >= 5000
}

/**
 * Calculate target prices based on broker and market data
 */
/*
export function calculateTargets(
  rataRataBandar: number,
  barangBandar: number,
  ara: number,
  arb: number,
  totalBid: number,
  totalOffer: number,
  harga: number
) {
  // Guard: avoid division by zero if bandar avg equals target
  // Calculate Fraksi
  const fraksi = getFraksi(harga);

  // Total Papan = (ARA - ARB) / Fraksi
  const totalPapan = (ara - arb) / fraksi;

  // Rata rata Bid Ofer = (Total Bid + Total Offer) / Total Papan
  const rataRataBidOfer = (totalBid + totalOffer) / totalPapan;

  // a = Rata rata bandar × 5%
  const a = rataRataBandar * 0.05;

  // p = Barang Bandar / Rata rata Bid Ofer
  const p = barangBandar / rataRataBidOfer;

  // Target Realistis = Rata rata bandar + a + (p/2 × Fraksi)
  const targetRealistis1 = rataRataBandar + a + ((p / 2) * fraksi);

  // Target Max = Rata rata bandar + a + (p × Fraksi)
  const targetMax = rataRataBandar + a + (p * fraksi);

  // Top% = seberapa jauh harga sudah bergerak dari avg bandar menuju target
  const rangeRealistis = Math.round(targetRealistis1) - rataRataBandar;
  const rangeMax = Math.round(targetMax) - rataRataBandar;
  const topPersenRealistis = rangeRealistis !== 0
    ? parseFloat((((harga - rataRataBandar) / rangeRealistis) * 100).toFixed(1))
    : 0;
  const topPersenMax = rangeMax !== 0
    ? parseFloat((((harga - rataRataBandar) / rangeMax) * 100).toFixed(1))
    : 0;

  return {
    fraksi,
    totalPapan: Math.round(totalPapan),
    rataRataBidOfer: Math.round(rataRataBidOfer),
    a: Math.round(a),
    p: Math.round(p),
    targetRealistis1: Math.round(targetRealistis1),
    targetMax: Math.round(targetMax),
    topPersenRealistis,
    topPersenMax,
  };
}*/

export function calculateTargets(
  rataRataBandar: number,
  barangBandar: number,
  ara: number,
  arb: number,
  totalBid: number,
  totalOffer: number,
  harga: number
) {
  // Hitung range pasar
  const marketRange = ara - arb || 1; // hindari 0

  // Fraksi adaptif: semakin besar range, semakin besar fraksi
  let fraksi = getFraksi(harga);
  if (marketRange / harga > 0.05) fraksi = Math.max(1, fraksi - 1); // konservatif jika volatil tinggi
  if (marketRange / harga < 0.02) fraksi = fraksi + 1; // agresif jika volatil rendah

  // Total papan
  const totalPapan = marketRange / fraksi;

  // Rata-rata bid/offer per papan
  const rataRataBidOfer = (totalBid + totalOffer) / totalPapan;

  // Adjustment dinamis: 3%–5% dari rata-rata bandar
  const a = rataRataBandar * (0.03 + Math.min(0.02, marketRange / harga));

  // Ratio p = proporsi barang bandar terhadap total pasar
  const p = barangBandar / (totalBid + totalOffer);

  // Target Realistis
  const targetRealistis = rataRataBandar + a + (p * fraksi * 0.5);

  // Target Max
  const targetMax = rataRataBandar + a + (p * fraksi);

  // Top% (0-100%)
  const topPersenRealistis = Math.max(
    0,
    Math.min(100, ((harga - rataRataBandar) / (targetRealistis - rataRataBandar)) * 100)
  );

  const topPersenMax = Math.max(
    0,
    Math.min(100, ((harga - rataRataBandar) / (targetMax - rataRataBandar)) * 100)
  );

  return {
    fraksi,
    totalPapan: Math.round(totalPapan),
    rataRataBidOfer: Math.round(rataRataBidOfer),
    a: Math.round(a),
    p: parseFloat(p.toFixed(3)),
    targetRealistis1: Math.round(targetRealistis1),
    targetMax: Math.round(targetMax),
    topPersenRealistis: parseFloat(topPersenRealistis.toFixed(1)),
    topPersenMax: parseFloat(topPersenMax.toFixed(1)),
  };
}
