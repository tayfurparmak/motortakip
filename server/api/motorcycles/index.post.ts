import { MotorcycleService } from '../../services/motorcycle.service'
import { motorcycleCreateSchema } from '../../../shared/schemas'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const validatedData = motorcycleCreateSchema.parse(body)

    const motorcycle = await MotorcycleService.create(validatedData)
    setResponseStatus(event, 201)
    return {
      success: true,
      data: motorcycle,
      message: 'Motor başarıyla eklendi.'
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
      statusMessage: error.statusMessage || 'Motor eklenirken bir hata oluştu.'
    })
  }
})

