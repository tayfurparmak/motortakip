import { MotorcycleService } from '../../services/motorcycle.service'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const search = typeof query.search === 'string' ? query.search : undefined
    const status = typeof query.status === 'string' ? query.status : undefined
    const brand = typeof query.brand === 'string' ? query.brand : undefined
    const page = query.page ? Number(query.page) : 1
    const limit = query.limit ? Number(query.limit) : 50

    return await MotorcycleService.listMotorcycles({
      search,
      status,
      brand,
      page,
      limit
    })
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Motorlar listelenirken bir hata oluştu.'
    })
  }
})

