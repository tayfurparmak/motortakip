import { MaintenanceService } from '../../../services/maintenance.service'
import { maintenanceRecordSchema } from '../../../../shared/schemas'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    if (!id) {
      throw createError({ statusCode: 400, statusMessage: 'Motor ID zorunludur.' })
    }

    const body = await readBody(event)
    const validatedData = maintenanceRecordSchema.parse(body)

    const result = await MaintenanceService.recordMaintenance(id, {
      maintenanceType: validatedData.maintenanceType as any,
      maintenanceDate: validatedData.maintenanceDate,
      maintenanceKm: validatedData.maintenanceKm,
      description: validatedData.description,
      cost: validatedData.cost
    })

    setResponseStatus(event, 201)
    return {
      success: true,
      data: result,
      message: 'Bakım kaydı başarıyla eklendi ve sonraki bakım otomatik hesaplandı.'
    }
  } catch (error: any) {
    if (error.name === 'ZodError') {
      const firstIssue = error.issues?.[0]?.message || 'Geçersiz bakım verisi.'
      throw createError({
        statusCode: 400,
        statusMessage: firstIssue
      })
    }

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Bakım kaydedilirken bir hata oluştu.'
    })
  }
})

