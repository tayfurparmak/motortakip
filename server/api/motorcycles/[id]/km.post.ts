import { MotorcycleService } from '../../../services/motorcycle.service'
import { updateKmSchema } from '../../../../shared/schemas'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    if (!id) {
      throw createError({ statusCode: 400, statusMessage: 'Motor ID zorunludur.' })
    }

    const body = await readBody(event)
    const { currentKm } = updateKmSchema.parse(body)

    const updated = await MotorcycleService.updateKm(id, currentKm)
    return {
      success: true,
      data: updated,
      message: `Kilometre ${currentKm.toLocaleString('tr-TR')} KM olarak güncellendi.`
    }
  } catch (error: any) {
    if (error.name === 'ZodError') {
      const firstIssue = error.issues?.[0]?.message || 'Geçersiz kilometre değeri.'
      throw createError({
        statusCode: 400,
        statusMessage: firstIssue
      })
    }

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Kilometre güncellenirken bir hata oluştu.'
    })
  }
})

