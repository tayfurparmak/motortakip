import { prisma } from '../utils/prisma'
import {
  calculateOilStatus,
  calculateInsuranceStatus,
  calculateInspectionStatus,
  checkNeedsWeeklyInspection
} from '../../shared/utils/calculations'
import type { MotorcycleItem, DashboardSummary } from '../../shared/types'

export class MotorcycleService {
  /**
   * Motor modelini UI hesaplanmış alanlarıyla zenginleştirir
   */
  static enrichMotorcycle(motorcycle: any): MotorcycleItem {
    const oil = calculateOilStatus(
      motorcycle.currentKm,
      motorcycle.lastOilChangeKm,
      motorcycle.oilChangeIntervalKm
    )

    const insurance = calculateInsuranceStatus(motorcycle.insuranceEndDate)
    const inspection = calculateInspectionStatus(motorcycle.inspectionExpiryDate)

    const lastInspection = motorcycle.weeklyInspections?.[0] ?? null
    const needsInspection = checkNeedsWeeklyInspection(lastInspection?.inspectionDate)

    return {
      ...motorcycle,
      nextOilChangeKm: oil.nextOilChangeKm,
      remainingKm: oil.remainingKm,
      oilStatus: oil.status,
      insuranceStatus: insurance.status,
      insuranceDaysLeft: insurance.daysLeft,
      inspectionStatus: inspection.status,
      inspectionDaysLeft: inspection.daysLeft,
      lastInspection,
      needsInspection
    }
  }

  /**
   * Filtrelenebilir ve sayfalanabilir motor listesi getirir
   */
  static async listMotorcycles(params: {
    search?: string
    status?: string // 'all' | 'ok' | 'upcoming' | 'overdue'
    brand?: string
    includeArchived?: boolean
    page?: number
    limit?: number
  }) {
    const page = Math.max(1, params.page || 1)
    const limit = Math.min(100, Math.max(1, params.limit || 50))
    const skip = (page - 1) * limit

    const where: any = {
      isArchived: params.includeArchived ? undefined : false
    }

    if (params.search) {
      const searchNormalized = params.search.trim()
      where.OR = [
        { plate: { contains: searchNormalized, mode: 'insensitive' } },
        { brand: { contains: searchNormalized, mode: 'insensitive' } },
        { model: { contains: searchNormalized, mode: 'insensitive' } }
      ]
    }

    if (params.brand) {
      where.brand = { equals: params.brand, mode: 'insensitive' }
    }

    // Toplam sayı
    const total = await prisma.motorcycle.count({ where })

    // Motorlar + ilişkili son kontroller
    const rawMotorcycles = await prisma.motorcycle.findMany({
      where,
      orderBy: [{ updatedAt: 'desc' }],
      skip,
      take: limit,
      include: {
        weeklyInspections: {
          orderBy: { inspectionDate: 'desc' },
          take: 1
        },
        _count: {
          select: {
            maintenanceRecords: true,
            weeklyInspections: true
          }
        }
      }
    })

    let enriched = rawMotorcycles.map((m) => this.enrichMotorcycle(m))

    // Duruma göre bellek içi filtreleme (statik SQL hesaplaması yerine esnek kontrol)
    if (params.status && params.status !== 'all') {
      enriched = enriched.filter((m) => m.oilStatus === params.status)
    }

    return {
      items: enriched,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  /**
   * Tek motor detayını getirir
   */
  static async getById(id: string) {
    const motorcycle = await prisma.motorcycle.findUnique({
      where: { id },
      include: {
        maintenanceRecords: {
          orderBy: { maintenanceDate: 'desc' }
        },
        weeklyInspections: {
          orderBy: { inspectionDate: 'desc' }
        },
        _count: {
          select: {
            maintenanceRecords: true,
            weeklyInspections: true
          }
        }
      }
    })

    if (!motorcycle) {
      return null
    }

    return this.enrichMotorcycle(motorcycle)
  }

  /**
   * Yeni motor ekler
   */
  static async create(data: {
    plate: string
    brand: string
    model: string
    currentKm: number
    lastOilChangeKm?: number | null
    lastOilChangeDate?: string | Date | null
    oilChangeIntervalKm?: number
    insuranceStartDate?: string | Date | null
    insuranceEndDate?: string | Date | null
    inspectionExpiryDate?: string | Date | null
    notes?: string | null
  }) {
    // Plaka benzersizlik kontrolü
    const existing = await prisma.motorcycle.findUnique({
      where: { plate: data.plate }
    })

    if (existing) {
      throw createError({
        statusCode: 409,
        statusMessage: `Bu plaka (${data.plate}) ile kayıtlı bir motor zaten mevcuttur.`
      })
    }

    const created = await prisma.motorcycle.create({
      data: {
        plate: data.plate,
        brand: data.brand,
        model: data.model,
        currentKm: data.currentKm,
        lastOilChangeKm: data.lastOilChangeKm ?? data.currentKm,
        lastOilChangeDate: data.lastOilChangeDate ? new Date(data.lastOilChangeDate) : null,
        oilChangeIntervalKm: data.oilChangeIntervalKm ?? 3000,
        insuranceStartDate: data.insuranceStartDate ? new Date(data.insuranceStartDate) : null,
        insuranceEndDate: data.insuranceEndDate ? new Date(data.insuranceEndDate) : null,
        inspectionExpiryDate: data.inspectionExpiryDate ? new Date(data.inspectionExpiryDate) : null,
        notes: data.notes ?? null
      }
    })

    return this.enrichMotorcycle(created)
  }

  /**
   * Motor bilgilerini günceller
   */
  static async update(
    id: string,
    data: {
      plate?: string
      brand?: string
      model?: string
      currentKm?: number
      lastOilChangeKm?: number | null
      lastOilChangeDate?: string | Date | null
      oilChangeIntervalKm?: number
      insuranceStartDate?: string | Date | null
      insuranceEndDate?: string | Date | null
      inspectionExpiryDate?: string | Date | null
      notes?: string | null
    }
  ) {
    // Motor var mı?
    const existing = await prisma.motorcycle.findUnique({ where: { id } })
    if (!existing) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Motor bulunamadı.'
      })
    }

    // Plaka değiştiyse başka motorda var mı?
    if (data.plate && data.plate !== existing.plate) {
      const duplicate = await prisma.motorcycle.findUnique({
        where: { plate: data.plate }
      })
      if (duplicate) {
        throw createError({
          statusCode: 409,
          statusMessage: `Bu plaka (${data.plate}) başka bir motora aittir.`
        })
      }
    }

    const updated = await prisma.motorcycle.update({
      where: { id },
      data: {
        plate: data.plate,
        brand: data.brand,
        model: data.model,
        currentKm: data.currentKm,
        lastOilChangeKm: data.lastOilChangeKm,
        lastOilChangeDate: data.lastOilChangeDate !== undefined
          ? (data.lastOilChangeDate ? new Date(data.lastOilChangeDate) : null)
          : undefined,
        oilChangeIntervalKm: data.oilChangeIntervalKm,
        insuranceStartDate: data.insuranceStartDate !== undefined
          ? (data.insuranceStartDate ? new Date(data.insuranceStartDate) : null)
          : undefined,
        insuranceEndDate: data.insuranceEndDate !== undefined
          ? (data.insuranceEndDate ? new Date(data.insuranceEndDate) : null)
          : undefined,
        inspectionExpiryDate: data.inspectionExpiryDate !== undefined
          ? (data.inspectionExpiryDate ? new Date(data.inspectionExpiryDate) : null)
          : undefined,
        notes: data.notes
      }
    })

    return this.enrichMotorcycle(updated)
  }

  /**
   * Yalnızca kilometreyi günceller
   */
  static async updateKm(id: string, currentKm: number) {
    const existing = await prisma.motorcycle.findUnique({ where: { id } })
    if (!existing) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Motor bulunamadı.'
      })
    }

    if (currentKm < 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Kilometre negatif olamaz.'
      })
    }

    const updated = await prisma.motorcycle.update({
      where: { id },
      data: { currentKm }
    })

    return this.enrichMotorcycle(updated)
  }

  /**
   * Güvenli soft delete (Arşivleme)
   */
  static async archive(id: string) {
    const existing = await prisma.motorcycle.findUnique({ where: { id } })
    if (!existing) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Motor bulunamadı.'
      })
    }

    await prisma.motorcycle.update({
      where: { id },
      data: { isArchived: true }
    })

    return { success: true, message: 'Motor başarıyla arşivlendi.' }
  }

  /**
   * Dashboard için canlı özet sayaçlarını hesaplar
   */
  static async getDashboardSummary(): Promise<DashboardSummary> {
    const motorcycles = await prisma.motorcycle.findMany({
      where: { isArchived: false },
      include: {
        weeklyInspections: {
          orderBy: { inspectionDate: 'desc' },
          take: 1
        }
      }
    })

    let upcomingMaintenance = 0
    let overdueMaintenance = 0
    let upcomingInsurance = 0
    let upcomingInspection = 0
    let pendingWeeklyInspections = 0

    for (const m of motorcycles) {
      const enriched = this.enrichMotorcycle(m)

      if (enriched.oilStatus === 'upcoming') upcomingMaintenance++
      if (enriched.oilStatus === 'overdue') overdueMaintenance++
      if (enriched.insuranceStatus === 'upcoming' || enriched.insuranceStatus === 'expired') upcomingInsurance++
      if (enriched.inspectionStatus === 'upcoming' || enriched.inspectionStatus === 'expired') upcomingInspection++
      if (enriched.needsInspection) pendingWeeklyInspections++
    }

    return {
      totalMotorcycles: motorcycles.length,
      upcomingMaintenance,
      overdueMaintenance,
      upcomingInsurance,
      upcomingInspection,
      pendingWeeklyInspections
    }
  }
}

