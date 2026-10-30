import { MaintenanceService } from '../../../services/maintenance.service'
import { weeklyInspectionSchema } from '../../../../shared/schemas'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    if (!id) {
      throw createError({ statusCode: 400, statusMessage: 'Motor ID zorunludur.' })
    }

    const body = await readBody(event)
    const validatedData = weeklyInspectionSchema.parse(body)

    const result = await MaintenanceService.recordWeeklyInspection(id, {
      inspectionDate: validatedData.inspectionDate,
      inspectorName: validatedData.inspectorName,
      oilLevel: validatedData.oilLevel as any,
      result: validatedData.result as any,
      notes: validatedData.notes
    })

    setResponseStatus(event, 201)
    return {
      success: true,
      data: result,
      message: 'Haftalık kontrol kaydı başarıyla oluşturuldu.'
    }
  } catch (error: any) {
    if (error.name === 'ZodError') {
      const firstIssue = error.issues?.[0]?.message || 'Geçersiz kontrol verisi.'
      throw createError({
        statusCode: 400,
        statusMessage: firstIssue
      })
    }

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Haftalık kontrol kaydedilirken bir hata oluştu.'
    })
  }
})

