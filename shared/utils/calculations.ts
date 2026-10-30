export type OilStatus = 'ok' | 'upcoming' | 'overdue'
export type DateStatus = 'active' | 'upcoming' | 'expired' | 'missing'
export type InspectionDateStatus = 'valid' | 'upcoming' | 'expired' | 'missing'

/**
 * Yağ bakım kilometre ve durum hesaplaması
 * @param currentKm Güncel kilometre
 * @param lastOilChangeKm Son yağ bakım kilometresi (yoksa 0 kabul edilir)
 * @param intervalKm Bakım aralığı (varsayılan 3000)
 */
export function calculateOilStatus(
  currentKm: number,
  lastOilChangeKm: number | null | undefined,
  intervalKm: number = 3000
): {
  nextOilChangeKm: number
  remainingKm: number
  status: OilStatus
} {
  const baseKm = lastOilChangeKm ?? 0
  const nextOilChangeKm = baseKm + intervalKm
  const remainingKm = nextOilChangeKm - currentKm

  let status: OilStatus = 'ok'
  if (remainingKm < 0) {
    status = 'overdue'
  } else if (remainingKm <= 500) {
    status = 'upcoming'
  } else {
    status = 'ok'
  }

  return {
    nextOilChangeKm,
    remainingKm,
    status
  }
}

/**
 * Sigorta kalan gün ve durum hesaplaması
 */
export function calculateInsuranceStatus(
  endDate: string | Date | null | undefined,
  referenceDate: Date = new Date()
): {
  daysLeft: number | null
  status: DateStatus
} {
  if (!endDate) {
    return { daysLeft: null, status: 'missing' }
  }

  const end = new Date(endDate)
  if (isNaN(end.getTime())) {
    return { daysLeft: null, status: 'missing' }
  }

  // Gün farkını sıfır saat bazında hesapla
  const refMidnight = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate())
  const endMidnight = new Date(end.getFullYear(), end.getMonth(), end.getDate())
  const diffTime = endMidnight.getTime() - refMidnight.getTime()
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  let status: DateStatus = 'active'
  if (daysLeft < 0) {
    status = 'expired'
  } else if (daysLeft <= 30) {
    status = 'upcoming'
  } else {
    status = 'active'
  }

  return { daysLeft, status }
}

/**
 * Muayene kalan gün ve durum hesaplaması
 */
export function calculateInspectionStatus(
  expiryDate: string | Date | null | undefined,
  referenceDate: Date = new Date()
): {
  daysLeft: number | null
  status: InspectionDateStatus
} {
  const result = calculateInsuranceStatus(expiryDate, referenceDate)
  let status: InspectionDateStatus = 'missing'

  if (result.status === 'active') status = 'valid'
  else if (result.status === 'upcoming') status = 'upcoming'
  else if (result.status === 'expired') status = 'expired'
  else status = 'missing'

  return {
    daysLeft: result.daysLeft,
    status
  }
}

/**
 * Son 7 gün içerisinde haftalık kontrol yapılıp yapılmadığını kontrol eder
 */
export function checkNeedsWeeklyInspection(
  lastInspectionDate: string | Date | null | undefined,
  referenceDate: Date = new Date()
): boolean {
  if (!lastInspectionDate) return true

  const date = new Date(lastInspectionDate)
  if (isNaN(date.getTime())) return true

  const diffTime = referenceDate.getTime() - date.getTime()
  const diffDays = diffTime / (1000 * 60 * 60 * 24)

  return diffDays > 7
}

