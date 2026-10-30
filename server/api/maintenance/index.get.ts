import { MaintenanceService } from '../../services/maintenance.service'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const limit = query.limit ? Number(query.limit) : 50
  return await MaintenanceService.listAllMaintenance(limit)
})

