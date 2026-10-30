import { z } from 'zod'

// Plaka normalizasyonu (Türkçe karakterler, boşluklar, büyük harf)
export function normalizePlate(plate: string): string {
  return plate
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleUpperCase('tr-TR')
}

export const motorcycleCreateSchema = z.object({
  plate: z
    .string()
    .min(2, 'Plaka en az 2 karakter olmalıdır.')
    .max(20, 'Plaka çok uzun.')
    .transform(normalizePlate),
  brand: z.string().min(1, 'Marka zorunludur.').max(50),
  model: z.string().min(1, 'Model zorunludur.').max(50),
  currentKm: z.coerce
    .number()
    .int('Kilometre tam sayı olmalıdır.')
    .min(0, 'Kilometre negatif olamaz.'),
  lastOilChangeKm: z.coerce
    .number()
    .int()
    .min(0, 'Son bakım kilometresi negatif olamaz.')
    .optional()
    .nullable(),
  lastOilChangeDate: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/))
    .optional()
    .nullable(),
  oilChangeIntervalKm: z.coerce
    .number()
    .int()
    .min(500, 'Bakım aralığı en az 500 KM olmalıdır.')
    .default(3000),
  insuranceStartDate: z.string().optional().nullable(),
  insuranceEndDate: z.string().optional().nullable(),
  inspectionExpiryDate: z.string().optional().nullable(),
  notes: z.string().max(500).optional().nullable()
})

export const motorcycleUpdateSchema = motorcycleCreateSchema.partial()

export const updateKmSchema = z.object({
  currentKm: z.coerce
    .number()
    .int('Kilometre tam sayı olmalıdır.')
    .min(0, 'Kilometre negatif olamaz.')
})

export const maintenanceRecordSchema = z.object({
  maintenanceType: z.enum([
    'OIL_CHANGE',
    'FILTER_CHANGE',
    'BRAKE_SERVICE',
    'TYRE_CHANGE',
    'CHAIN_SERVICE',
    'GENERAL_SERVICE',
    'OTHER'
  ]),
  maintenanceDate: z.string().min(1, 'Tarih zorunludur.'),
  maintenanceKm: z.coerce
    .number()
    .int()
    .min(0, 'Bakım kilometresi negatif olamaz.'),
  description: z.string().max(500).optional().nullable(),
  cost: z.coerce
    .number()
    .min(0, 'Maliyet negatif olamaz.')
    .optional()
    .nullable()
})

export const weeklyInspectionSchema = z.object({
  inspectionDate: z.string().optional().nullable(),
  inspectorName: z.string().max(100).optional().nullable(),
  oilLevel: z.enum(['NORMAL', 'LOW', 'CRITICAL']),
  result: z.enum(['OK', 'MAINTENANCE_NEEDED', 'URGENT_ACTION']),
  notes: z.string().max(500).optional().nullable()
})

