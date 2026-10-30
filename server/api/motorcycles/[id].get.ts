import { MotorcycleService } from '../../services/motorcycle.service'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Motor ID zorunludur.' })
  }

  const motorcycle = await MotorcycleService.getById(id)
  if (!motorcycle) {
    throw createError({ statusCode: 404, statusMessage: 'Motor bulunamadı.' })
  }

  return motorcycle
})

