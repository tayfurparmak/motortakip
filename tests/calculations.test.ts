import { describe, it, expect } from 'vitest'
import {
  calculateOilStatus,
  calculateInsuranceStatus,
  calculateInspectionStatus,
  checkNeedsWeeklyInspection
} from '../shared/utils/calculations'
import {
  normalizePlate,
  motorcycleCreateSchema,
  updateKmSchema,
  maintenanceRecordSchema,
  weeklyInspectionSchema
} from '../shared/schemas'

describe('Yağ Bakım Hesaplamaları (Section 5)', () => {
  it('Kalan KM > 500 olduğunda durum "ok" (yeşil) olmalı', () => {
    const result = calculateOilStatus(24000, 22000, 3000)
    expect(result.nextOilChangeKm).toBe(25000)
    expect(result.remainingKm).toBe(1000)
    expect(result.status).toBe('ok')
  })

  it('Kalan KM 0-500 arası olduğunda durum "upcoming" (turuncu) olmalı', () => {
    const result = calculateOilStatus(24500, 22000, 3000)
    expect(result.nextOilChangeKm).toBe(25000)
    expect(result.remainingKm).toBe(500)
    expect(result.status).toBe('upcoming')
  })

  it('Kalan KM < 0 olduğunda durum "overdue" (kırmızı / gecikmiş) olmalı', () => {
    const result = calculateOilStatus(25200, 22000, 3000)
    expect(result.nextOilChangeKm).toBe(25000)
    expect(result.remainingKm).toBe(-200)
    expect(result.status).toBe('overdue')
  })

  it('Son yağ bakım KM hiç girilmediyse varsayılan 0 üzerinden hesaplamalı', () => {
    const result = calculateOilStatus(1200, null, 3000)
    expect(result.nextOilChangeKm).toBe(3000)
    expect(result.remainingKm).toBe(1800)
    expect(result.status).toBe('ok')
  })

  it('Bakım aralığı özelleştirildiğinde doğru sonraki KM hesaplanmalı', () => {
    // 5.000 KM aralık
    const result = calculateOilStatus(16000, 15000, 5000)
    expect(result.nextOilChangeKm).toBe(20000)
    expect(result.remainingKm).toBe(4000)
  })
})

describe('Sigorta ve Muayene Kalan Gün & Durum Hesaplamaları (Section 7 & 8)', () => {
  const baseDate = new Date('2026-10-30T12:00:00Z')

  it('Sigorta bitişine > 30 gün varsa "active" olmalı', () => {
    const futureDate = '2026-12-15'
    const result = calculateInsuranceStatus(futureDate, baseDate)
    expect(result.status).toBe('active')
    expect(result.daysLeft).toBeGreaterThan(30)
  })

  it('Sigorta bitişine 0-30 gün kaldıysa "upcoming" olmalı', () => {
    const soonDate = '2026-11-10'
    const result = calculateInsuranceStatus(soonDate, baseDate)
    expect(result.status).toBe('upcoming')
    expect(result.daysLeft).toBe(11)
  })

  it('Sigorta tarihi geçtiyse "expired" olmalı', () => {
    const pastDate = '2026-10-15'
    const result = calculateInsuranceStatus(pastDate, baseDate)
    expect(result.status).toBe('expired')
    expect(result.daysLeft).toBeLessThan(0)
  })

  it('Tarih girilmediğinde "missing" olmalı', () => {
    const result = calculateInsuranceStatus(null, baseDate)
    expect(result.status).toBe('missing')
    expect(result.daysLeft).toBeNull()
  })

  it('Muayene geçerli ise "valid" dönmeli', () => {
    const futureDate = '2027-05-01'
    const result = calculateInspectionStatus(futureDate, baseDate)
    expect(result.status).toBe('valid')
  })
})

describe('Haftalık Kontrol Takibi (Section 6)', () => {
  const baseDate = new Date('2026-10-30T12:00:00Z')

  it('Son 7 gün içinde kontrol yapıldıysa kontrol beklememeli', () => {
    const recent = new Date('2026-10-28T10:00:00Z')
    expect(checkNeedsWeeklyInspection(recent, baseDate)).toBe(false)
  })

  it('7 günden daha eski kontrol veya hiç kontrol yoksa "Kontrol Bekliyor" (true) olmalı', () => {
    const old = new Date('2026-10-20T10:00:00Z')
    expect(checkNeedsWeeklyInspection(old, baseDate)).toBe(true)
    expect(checkNeedsWeeklyInspection(null, baseDate)).toBe(true)
  })
})

describe('Plaka Normalizasyonu ve Form Doğrulaması (Section 4, 11 & 15)', () => {
  it('Türkçe küçük harfli plakayı ve fazla boşlukları düzeltmeli', () => {
    expect(normalizePlate('  35 abc  123 ')).toBe('35 ABC 123')
    expect(normalizePlate('34 ıjk 99')).toBe('34 IJK 99')
  })

  it('Negatif kilometreyi reddetmeli', () => {
    const parseResult = motorcycleCreateSchema.safeParse({
      plate: '35 ABC 123',
      brand: 'Honda',
      model: 'PCX',
      currentKm: -50
    })
    expect(parseResult.success).toBe(false)
  })

  it('Zorunlu alanlar boş olduğunda doğrulamadan geçmemeli', () => {
    const invalid = motorcycleCreateSchema.safeParse({
      plate: '',
      brand: '',
      model: '',
      currentKm: 'abc'
    })
    expect(invalid.success).toBe(false)
  })

  it('Hızlı kilometre güncelleme şeması geçerli ve pozitif olmalı', () => {
    expect(updateKmSchema.safeParse({ currentKm: 15400 }).success).toBe(true)
    expect(updateKmSchema.safeParse({ currentKm: -1 }).success).toBe(false)
  })

  it('Bakım kaydı oluşturma şeması geçerli bakım türlerini doğrulamalı', () => {
    const valid = maintenanceRecordSchema.safeParse({
      maintenanceType: 'OIL_CHANGE',
      maintenanceDate: '2026-10-30',
      maintenanceKm: 25000,
      cost: 750.50,
      description: 'Yağ değişti'
    })
    expect(valid.success).toBe(true)

    const invalidType = maintenanceRecordSchema.safeParse({
      maintenanceType: 'INVALID_TYPE',
      maintenanceDate: '2026-10-30',
      maintenanceKm: 25000
    })
    expect(invalidType.success).toBe(false)
  })

  it('Haftalık kontrol şeması yağ seviyesi ve sonuç enumlarını doğrulamalı', () => {
    const valid = weeklyInspectionSchema.safeParse({
      inspectorName: 'Ahmet Usta',
      oilLevel: 'NORMAL',
      result: 'OK',
      notes: 'Sorun yok'
    })
    expect(valid.success).toBe(true)

    const invalidLevel = weeklyInspectionSchema.safeParse({
      oilLevel: 'SUPER_HIGH',
      result: 'OK'
    })
    expect(invalidLevel.success).toBe(false)
  })
})
