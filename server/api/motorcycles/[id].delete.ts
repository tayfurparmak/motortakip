import { MotorcycleService } from '../../services/motorcycle.service'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Motor ID zorunludur.' })
  }

  return await MotorcycleService.archive(id)
})

