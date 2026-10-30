import { MaintenanceService } from '../../../services/maintenance.service'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Motor ID zorunludur.' })
  }

  return await MaintenanceService.getMotorcycleInspections(id)
})

