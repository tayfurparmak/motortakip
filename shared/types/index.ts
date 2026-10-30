export type MaintenanceTypeEnum =
  | 'OIL_CHANGE'
  | 'FILTER_CHANGE'
  | 'BRAKE_SERVICE'
  | 'TYRE_CHANGE'
  | 'CHAIN_SERVICE'
  | 'GENERAL_SERVICE'
  | 'OTHER'

export type OilLevelEnum = 'NORMAL' | 'LOW' | 'CRITICAL'

export type InspectionResultEnum = 'OK' | 'MAINTENANCE_NEEDED' | 'URGENT_ACTION'

export type StatusLevel = 'success' | 'warning' | 'danger' | 'neutral'

export interface MotorcycleItem {
  id: string
  plate: string
  brand: string
  model: string
  currentKm: number
  lastOilChangeKm: number | null
  lastOilChangeDate: string | Date | null
  oilChangeIntervalKm: number
  insuranceStartDate: string | Date | null
  insuranceEndDate: string | Date | null
  inspectionExpiryDate: string | Date | null
  notes: string | null
  isArchived: boolean
  createdAt: string | Date
  updatedAt: string | Date

  // Calculated helper fields for UI
  nextOilChangeKm: number
  remainingKm: number
  oilStatus: 'ok' | 'upcoming' | 'overdue' // ok: >500, upcoming: 0-500, overdue: <0
  insuranceStatus: 'active' | 'upcoming' | 'expired' | 'missing' // active: >30d, upcoming: 0-30d, expired: <0d
  insuranceDaysLeft: number | null
  inspectionStatus: 'valid' | 'upcoming' | 'expired' | 'missing' // valid: >30d, upcoming: 0-30d, expired: <0d
  inspectionDaysLeft: number | null
  lastInspection?: WeeklyInspectionItem | null
  needsInspection: boolean // son 7 gün kontrol yoksa true

  _count?: {
    maintenanceRecords: number
    weeklyInspections: number
  }
}

export interface MaintenanceRecordItem {
  id: string
  motorcycleId: string
  maintenanceType: MaintenanceTypeEnum
  maintenanceDate: string | Date
  maintenanceKm: number
  description: string | null
  cost: number | null
  createdAt: string | Date
  motorcycle?: {
    plate: string
    brand: string
    model: string
  }
}

export interface WeeklyInspectionItem {
  id: string
  motorcycleId: string
  inspectionDate: string | Date
  inspectorName: string | null
  oilLevel: OilLevelEnum
  result: InspectionResultEnum
  notes: string | null
  createdAt: string | Date
  motorcycle?: {
    plate: string
    brand: string
    model: string
  }
}

export interface DashboardSummary {
  totalMotorcycles: number
  upcomingMaintenance: number
  overdueMaintenance: number
  upcomingInsurance: number
  upcomingInspection: number
  pendingWeeklyInspections: number
}

