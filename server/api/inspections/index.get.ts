import { MaintenanceService } from '../../services/maintenance.service'

export default defineEventHandler(async () => {
  return await MaintenanceService.getWeeklyInspectionOverview()
})

