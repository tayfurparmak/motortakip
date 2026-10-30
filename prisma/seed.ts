import { PrismaClient, MaintenanceType, OilLevel, InspectionResult } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Veritabanı temizleniyor...')
  await prisma.weeklyInspection.deleteMany()
  await prisma.maintenanceRecord.deleteMany()
  await prisma.motorcycle.deleteMany()

  const now = new Date()
  const daysFromNow = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000)

  console.log('Örnek veriler ekleniyor...')

  // 1. Bakımı Yaklaşan Motor (Kalan KM: 150 KM - Turuncu)
  const bike1 = await prisma.motorcycle.create({
    data: {
      plate: '35 ABC 101',
      brand: 'Honda',
      model: 'Forza 250',
      currentKm: 14850,
      lastOilChangeKm: 12000,
      lastOilChangeDate: daysFromNow(-60),
      oilChangeIntervalKm: 3000,
      insuranceStartDate: daysFromNow(-200),
      insuranceEndDate: daysFromNow(165),
      inspectionExpiryDate: daysFromNow(240),
      notes: 'Filo No: 101 - Şehir içi teslimat aracı',
      maintenanceRecords: {
        create: [
          {
            maintenanceType: MaintenanceType.OIL_CHANGE,
            maintenanceDate: daysFromNow(-60),
            maintenanceKm: 12000,
            description: '10W-40 Motul yağ ve yağ filtresi değişimi yapıldı.',
            cost: 850.00
          },
          {
            maintenanceType: MaintenanceType.BRAKE_SERVICE,
            maintenanceDate: daysFromNow(-150),
            maintenanceKm: 9000,
            description: 'Ön ve arka fren balataları yenilendi.',
            cost: 1200.00
          }
        ]
      },
      weeklyInspections: {
        create: [
          {
            inspectionDate: daysFromNow(-2),
            inspectorName: 'Ahmet Usta',
            oilLevel: OilLevel.NORMAL,
            result: InspectionResult.OK,
            notes: 'Lastik havaları ve yağ seviyesi kontrol edildi.'
          }
        ]
      }
    }
  })

  // 2. Bakımı Geciken Motor (Kalan KM: -200 KM - Kırmızı)
  const bike2 = await prisma.motorcycle.create({
    data: {
      plate: '34 DEF 202',
      brand: 'Yamaha',
      model: 'XMAX 250',
      currentKm: 21200,
      lastOilChangeKm: 18000,
      lastOilChangeDate: daysFromNow(-90),
      oilChangeIntervalKm: 3000,
      insuranceStartDate: daysFromNow(-180),
      insuranceEndDate: daysFromNow(185),
      inspectionExpiryDate: daysFromNow(120),
      notes: 'Filo No: 202 - Bakım kilometresini 200 km aştı, acil servis gerekiyor.',
      maintenanceRecords: {
        create: [
          {
            maintenanceType: MaintenanceType.OIL_CHANGE,
            maintenanceDate: daysFromNow(-90),
            maintenanceKm: 18000,
            description: 'Yamalube tam sentetik yağ değişimi.',
            cost: 950.00
          }
        ]
      },
      weeklyInspections: {
        create: [
          {
            inspectionDate: daysFromNow(-1),
            inspectorName: 'Mehmet Kalfa',
            oilLevel: OilLevel.LOW,
            result: InspectionResult.URGENT_ACTION,
            notes: 'Yağ seviyesi düşük, bakım km si geçmiş acil yağ değişimi şart.'
          }
        ]
      }
    }
  })

  // 3. Sigortası Yaklaşan Motor (Kalan Sigorta: 12 gün - Turuncu)
  const bike3 = await prisma.motorcycle.create({
    data: {
      plate: '06 GHI 303',
      brand: 'SYM',
      model: 'Jet 14 125',
      currentKm: 8200,
      lastOilChangeKm: 7000,
      lastOilChangeDate: daysFromNow(-30),
      oilChangeIntervalKm: 3000,
      insuranceStartDate: daysFromNow(-353),
      insuranceEndDate: daysFromNow(12), // 12 gün kaldı
      inspectionExpiryDate: daysFromNow(190),
      notes: 'Filo No: 303 - Sigorta yenileme teklifleri toplanmalı.',
      maintenanceRecords: {
        create: [
          {
            maintenanceType: MaintenanceType.OIL_CHANGE,
            maintenanceDate: daysFromNow(-30),
            maintenanceKm: 7000,
            description: 'Yağ değişimi ve zincir yağlama.',
            cost: 650.00
          }
        ]
      },
      weeklyInspections: {
        create: [
          {
            inspectionDate: daysFromNow(-4),
            inspectorName: 'Ahmet Usta',
            oilLevel: OilLevel.NORMAL,
            result: InspectionResult.OK,
            notes: 'Genel kontrol yapıldı, mekanik sorun yok.'
          }
        ]
      }
    }
  })

  // 4. Muayenesi Geçmiş Motor (Muayene: 15 gün önce doldu - Kırmızı)
  const bike4 = await prisma.motorcycle.create({
    data: {
      plate: '16 JKL 404',
      brand: 'Bajaj',
      model: 'Pulsar NS 200',
      currentKm: 19500,
      lastOilChangeKm: 18000,
      lastOilChangeDate: daysFromNow(-45),
      oilChangeIntervalKm: 3000,
      insuranceStartDate: daysFromNow(-100),
      insuranceEndDate: daysFromNow(265),
      inspectionExpiryDate: daysFromNow(-15), // 15 gün önce doldu
      notes: 'Filo No: 404 - TÜVTÜRK muayenesi geçti! Trafiğe çıkışı durduruldu.',
      maintenanceRecords: {
        create: [
          {
            maintenanceType: MaintenanceType.GENERAL_SERVICE,
            maintenanceDate: daysFromNow(-45),
            maintenanceKm: 18000,
            description: '18 bin ağır bakımı, buji ve filtreler değişti.',
            cost: 1600.00
          }
        ]
      },
      weeklyInspections: {
        create: [
          {
            inspectionDate: daysFromNow(-10), // 10 gün önce (Haftalık kontrol bekliyor!)
            inspectorName: 'Ali Teknisyen',
            oilLevel: OilLevel.NORMAL,
            result: InspectionResult.OK,
            notes: 'Motor garajda muayene randevusu bekliyor.'
          }
        ]
      }
    }
  })

  // 5. Tüm İşlemleri Güncel Motor (Kalan KM: 2900 KM - Yeşil, Sigorta & Muayene güncel)
  const bike5 = await prisma.motorcycle.create({
    data: {
      plate: '07 MNO 505',
      brand: 'Vespa',
      model: 'Primavera 150',
      currentKm: 5100,
      lastOilChangeKm: 5000,
      lastOilChangeDate: daysFromNow(-10),
      oilChangeIntervalKm: 3000,
      insuranceStartDate: daysFromNow(-60),
      insuranceEndDate: daysFromNow(305),
      inspectionExpiryDate: daysFromNow(480),
      notes: 'Filo No: 505 - Yönetici kullanım aracı. Eksiksiz ve sorunsuz.',
      maintenanceRecords: {
        create: [
          {
            maintenanceType: MaintenanceType.OIL_CHANGE,
            maintenanceDate: daysFromNow(-10),
            maintenanceKm: 5000,
            description: '5000 km periyodik yetkili servis bakımı.',
            cost: 1450.00
          }
        ]
      },
      weeklyInspections: {
        create: [
          {
            inspectionDate: daysFromNow(-3),
            inspectorName: 'Ahmet Usta',
            oilLevel: OilLevel.NORMAL,
            result: InspectionResult.OK,
            notes: 'Kusursuz kondisyonda.'
          }
        ]
      }
    }
  })

  console.log('Örnek veriler başarıyla eklendi!')
  console.log(`Eklenen motorlar: ${bike1.plate}, ${bike2.plate}, ${bike3.plate}, ${bike4.plate}, ${bike5.plate}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

