import { prisma } from '../utils/prisma'
import { Prisma, MaintenanceType, OilLevel, InspectionResult } from '@prisma/client'
import { checkNeedsWeeklyInspection } from '../../shared/utils/calculations'
import { MotorcycleService } from './motorcycle.service'

export class MaintenanceService {
  /**
   * Bakım kaydı oluşturur ve Prisma transaction içinde motorun bakım durumunu günceller
   */
  static async recordMaintenance(
    motorcycleId: string,
    data: {
      maintenanceType: MaintenanceType
      maintenanceDate: string | Date
      maintenanceKm: number
      description?: string | null
      cost?: number | null
    }
  ) {
    return await prisma.$transaction(async (tx) => {
      // 1. Motorun varlığını kontrol et
      const motorcycle = await tx.motorcycle.findUnique({
        where: { id: motorcycleId }
      })

      if (!motorcycle) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Motosiklet bulunamadı.'
        })
      }

      const maintDate = new Date(data.maintenanceDate)

      // 2. Bakım kaydını oluştur
      const record = await tx.maintenanceRecord.create({
        data: {
          motorcycleId,
          maintenanceType: data.maintenanceType,
          maintenanceDate: maintDate,
          maintenanceKm: data.maintenanceKm,
          description: data.description ?? null,
          cost: data.cost !== undefined && data.cost !== null ? new Prisma.Decimal(data.cost) : null
        }
      })

      // 3. Yağ değişimi veya Genel bakım yapıldıysa motorun son bakım KM ve tarihini güncelle
      const updateData: any = {}

      if (
        data.maintenanceType === MaintenanceType.OIL_CHANGE ||
        data.maintenanceType === MaintenanceType.GENERAL_SERVICE
      ) {
        updateData.lastOilChangeKm = data.maintenanceKm
        updateData.lastOilChangeDate = maintDate
      }

      // Eğer bakım kilometresinde girilen değer güncel KM'den yüksekse kilometre sayacını da ilerlet
      if (data.maintenanceKm > motorcycle.currentKm) {
        updateData.currentKm = data.maintenanceKm
      }

      let updatedMotorcycle = motorcycle
      if (Object.keys(updateData).length > 0) {
        updatedMotorcycle = await tx.motorcycle.update({
          where: { id: motorcycleId },
          data: updateData
        })
      }

      return {
        record: {
          ...record,
          cost: record.cost ? Number(record.cost) : null
        },
        motorcycle: MotorcycleService.enrichMotorcycle(updatedMotorcycle)
      }
    })
  }

  /**
   * Bir motorun geçmiş bakım kayıtlarını listeler
   */
  static async getMotorcycleMaintenance(motorcycleId: string) {
    const records = await prisma.maintenanceRecord.findMany({
      where: { motorcycleId },
      orderBy: { maintenanceDate: 'desc' },
      include: {
        motorcycle: {
          select: {
            plate: true,
            brand: true,
            model: true
          }
        }
      }
    })

    return records.map((r) => ({
      ...r,
      cost: r.cost ? Number(r.cost) : null
    }))
  }

  /**
   * Tüm filodaki son bakım kayıtlarını listeler
   */
  static async listAllMaintenance(limit = 50) {
    const records = await prisma.maintenanceRecord.findMany({
      take: limit,
      orderBy: { maintenanceDate: 'desc' },
      include: {
        motorcycle: {
          select: {
            id: true,
            plate: true,
            brand: true,
            model: true
          }
        }
      }
    })

    return records.map((r) => ({
      ...r,
      cost: r.cost ? Number(r.cost) : null
    }))
  }

  /**
   * Haftalık yağ kontrol kaydı oluşturur
   * NOT: Son yağ değişimi kilometresini SIFIRLAMAZ (Section 6 kuralı)
   */
  static async recordWeeklyInspection(
    motorcycleId: string,
    data: {
      inspectionDate?: string | Date | null
      inspectorName?: string | null
      oilLevel: OilLevel
      result: InspectionResult
      notes?: string | null
    }
  ) {
    const motorcycle = await prisma.motorcycle.findUnique({
      where: { id: motorcycleId }
    })

    if (!motorcycle) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Motosiklet bulunamadı.'
      })
    }

    const inspection = await prisma.weeklyInspection.create({
      data: {
        motorcycleId,
        inspectionDate: data.inspectionDate ? new Date(data.inspectionDate) : new Date(),
        inspectorName: data.inspectorName ?? null,
        oilLevel: data.oilLevel,
        result: data.result,
        notes: data.notes ?? null
      },
      include: {
        motorcycle: {
          select: {
            plate: true,
            brand: true,
            model: true
          }
        }
      }
    })

    return inspection
  }

  /**
   * Bir motorun haftalık kontrol geçmişini getirir
   */
  static async getMotorcycleInspections(motorcycleId: string) {
    return await prisma.weeklyInspection.findMany({
      where: { motorcycleId },
      orderBy: { inspectionDate: 'desc' }
    })
  }

  /**
   * Tüm motorların haftalık kontrol durumlarını listeler (Section 6)
   * Son 7 gün kontrol yapılmayanları 'Kontrol Bekliyor' olarak işaretler
   */
  static async getWeeklyInspectionOverview() {
    const motorcycles = await prisma.motorcycle.findMany({
      where: { isArchived: false },
      include: {
        weeklyInspections: {
          orderBy: { inspectionDate: 'desc' },
          take: 1
        }
      },
      orderBy: { plate: 'asc' }
    })

    return motorcycles.map((m) => {
      const lastInspection = m.weeklyInspections[0] ?? null
      const needsInspection = checkNeedsWeeklyInspection(lastInspection?.inspectionDate)

      return {
        motorcycleId: m.id,
        plate: m.plate,
        brand: m.brand,
        model: m.model,
        currentKm: m.currentKm,
        lastInspectionDate: lastInspection?.inspectionDate ?? null,
        inspectorName: lastInspection?.inspectorName ?? null,
        oilLevel: lastInspection?.oilLevel ?? null,
        result: lastInspection?.result ?? null,
        notes: lastInspection?.notes ?? null,
        needsInspection
      }
    })
  }
}

