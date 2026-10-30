import { MotorcycleService } from '../../services/motorcycle.service'
import { motorcycleUpdateSchema } from '../../../shared/schemas'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    if (!id) {
      throw createError({ statusCode: 400, statusMessage: 'Motor ID zorunludur.' })
    }

    const body = await readBody(event)
    const validatedData = motorcycleUpdateSchema.parse(body)

    const updated = await MotorcycleService.update(id, validatedData)
    return {
      success: true,
      data: updated,
      message: 'Motor bilgileri güncellendi.'
    }
  } catch (error: any) {
    if (error.name === 'ZodError') {
      const firstIssue = error.issues?.[0]?.message || 'Geçersiz veri girişi.'
      throw createError({
        statusCode: 400,
        statusMessage: firstIssue
      })
    }

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Motor güncellenirken bir hata oluştu.'
    })
  }
})

