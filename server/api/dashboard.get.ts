import { MotorcycleService } from '../services/motorcycle.service'

export default defineEventHandler(async () => {
  return await MotorcycleService.getDashboardSummary()
})

