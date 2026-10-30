<template>
  <div class="space-y-6">
    <!-- Başlık ve Filtre -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 class="text-2xl font-extrabold text-slate-900 tracking-tight">Haftalık Yağ & Bakım Kontrolü</h2>
        <p class="text-sm text-slate-500 mt-1">
          Motosikletlerin yağ seviyelerini, periyodik muayenelerini ve haftalık kontrollerini takip edin.
        </p>
      </div>

      <!-- Tab Butonları -->
      <div class="flex items-center gap-2 p-1 bg-slate-200/70 rounded-xl">
        <button
          type="button"
          @click="activeTab = 'inspections'"
          class="px-4 py-2 rounded-lg text-xs font-semibold transition-all"
          :class="activeTab === 'inspections' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'"
        >
          Haftalık Kontroller
          <span
            v-if="pendingInspectionCount > 0"
            class="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-rose-100 text-rose-700 font-bold"
          >
            {{ pendingInspectionCount }}
          </span>
        </button>

        <button
          type="button"
          @click="activeTab = 'history'"
          class="px-4 py-2 rounded-lg text-xs font-semibold transition-all"
          :class="activeTab === 'history' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'"
        >
          Filo Bakım Geçmişi
        </button>
      </div>
    </div>

    <!-- TAB 1: HAFTALIK YAĞ KONTROLLERİ (Section 6) -->
    <div v-if="activeTab === 'inspections'" class="space-y-6">
      <!-- Özet Uyarı Kartı -->
      <div
        v-if="pendingInspectionCount > 0"
        class="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-4 text-amber-900"
      >
        <div class="flex items-center gap-3">
          <AlertCircle class="w-6 h-6 text-amber-600 shrink-0" />
          <div>
            <p class="text-sm font-bold">{{ pendingInspectionCount }} motor haftalık kontrol bekliyor!</p>
            <p class="text-xs text-amber-700 mt-0.5">Son 7 gün içinde kontrolü kaydedilmemiş araçların yağ ve mekanik durumunu kontrol ediniz.</p>
          </div>
        </div>
      </div>

      <!-- Haftalık Kontrol Tablosu -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div class="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 class="text-sm font-bold text-slate-900">Motosiklet Haftalık Kontrol Çizelgesi</h3>
          <span class="text-xs text-slate-500 font-medium">Toplam {{ inspectionOverview.length }} Motor</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr class="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th class="py-3.5 px-4 sm:px-6">Plaka</th>
                <th class="py-3.5 px-4">Marka & Model</th>
                <th class="py-3.5 px-4">Güncel KM</th>
                <th class="py-3.5 px-4">Son Kontrol Tarihi</th>
                <th class="py-3.5 px-4">Kontrol Eden</th>
                <th class="py-3.5 px-4">Yağ Seviyesi</th>
                <th class="py-3.5 px-4">Kontrol Sonucu</th>
                <th class="py-3.5 px-4">Durum</th>
                <th class="py-3.5 px-4 sm:px-6 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr
                v-for="item in inspectionOverview"
                :key="item.motorcycleId"
                class="hover:bg-slate-50/80 transition-colors"
              >
                <!-- Plaka -->
                <td class="py-4 px-4 sm:px-6 font-mono font-bold text-slate-900 whitespace-nowrap">
                  <NuxtLink
                    :to="`/motorlar/${item.motorcycleId}`"
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 hover:border-blue-400 hover:text-blue-600 transition-colors"
                  >
                    <span>{{ item.plate }}</span>
                  </NuxtLink>
                </td>

                <!-- Model -->
                <td class="py-4 px-4 whitespace-nowrap font-medium text-slate-800">
                  {{ item.brand }} {{ item.model }}
                </td>

                <!-- Güncel KM -->
                <td class="py-4 px-4 whitespace-nowrap font-mono font-semibold text-slate-900">
                  {{ item.currentKm.toLocaleString('tr-TR') }} KM
                </td>

                <!-- Son Kontrol Tarihi -->
                <td class="py-4 px-4 whitespace-nowrap text-xs text-slate-600">
                  {{ formatDate(item.lastInspectionDate) }}
                </td>

                <!-- Kontrol Eden -->
                <td class="py-4 px-4 whitespace-nowrap text-xs font-medium text-slate-700">
                  {{ item.inspectorName || '-' }}
                </td>

                <!-- Yağ Seviyesi -->
                <td class="py-4 px-4 whitespace-nowrap">
                  <UiBadge v-if="item.oilLevel" :variant="getOilLevelVariant(item.oilLevel)">
                    {{ getOilLevelLabel(item.oilLevel) }}
                  </UiBadge>
                  <span v-else class="text-slate-400 italic text-xs">-</span>
                </td>

                <!-- Sonuç -->
                <td class="py-4 px-4 whitespace-nowrap">
                  <UiBadge v-if="item.result" :variant="getResultVariant(item.result)">
                    {{ getResultLabel(item.result) }}
                  </UiBadge>
                  <span v-else class="text-slate-400 italic text-xs">-</span>
                </td>

                <!-- 7 Gün Durumu -->
                <td class="py-4 px-4 whitespace-nowrap">
                  <span
                    v-if="item.needsInspection"
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                    Kontrol Bekliyor
                  </span>
                  <span
                    v-else
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Güncel
                  </span>
                </td>

                <!-- Butonlar -->
                <td class="py-4 px-4 sm:px-6 whitespace-nowrap text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      @click="openInspectionModal(item)"
                      class="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 class="w-3.5 h-3.5" />
                      <span>Kontrol Yapıldı</span>
                    </button>

                    <button
                      type="button"
                      @click="openMaintenanceModal(item)"
                      class="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-800 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5"
                    >
                      <Wrench class="w-3.5 h-3.5" />
                      <span>Bakım Yapıldı</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 2: TÜM FİLO BAKIM GEÇMİŞİ -->
    <div v-else-if="activeTab === 'history'" class="space-y-4">
      <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
        <h3 class="text-sm font-bold text-slate-900 mb-4">Filo Genelinde Yapılan Son Bakımlar</h3>
        <MaintenanceMaintenanceHistoryList :records="maintenanceLogs" />
      </div>
    </div>

    <!-- Kontrol Yapıldı Modalı -->
    <MaintenanceWeeklyInspectionModal
      v-model="isInspectionModalOpen"
      :motorcycle="selectedItem"
      @saved="onInspectionSaved"
    />

    <!-- Bakım Yapıldı Modalı -->
    <MaintenanceMaintenanceModal
      v-model="isMaintenanceModalOpen"
      :motorcycle="selectedMotorcycleForMaint"
      @saved="onMaintenanceSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { AlertCircle, CheckCircle2, Wrench } from 'lucide-vue-next'
import { useToast } from '~/composables/useToast'
import type { MotorcycleItem, MaintenanceRecordItem, OilLevelEnum, InspectionResultEnum } from '~/shared/types'

const toast = useToast()
const activeTab = ref<'inspections' | 'history'>('inspections')

const isInspectionModalOpen = ref(false)
const isMaintenanceModalOpen = ref(false)
const selectedItem = ref<any>(null)
const selectedMotorcycleForMaint = ref<MotorcycleItem | null>(null)

// Haftalık kontrol verileri
const { data: inspectionOverviewData, refresh: refreshInspections } = await useFetch<any[]>('/api/inspections')
const inspectionOverview = computed(() => inspectionOverviewData.value ?? [])

// Filo bakım kayıtları
const { data: maintenanceLogsData, refresh: refreshMaintenance } = await useFetch<MaintenanceRecordItem[]>('/api/maintenance')
const maintenanceLogs = computed(() => maintenanceLogsData.value ?? [])

const pendingInspectionCount = computed(() => {
  return inspectionOverview.value.filter((i) => i.needsInspection).length
})

const openInspectionModal = (item: any) => {
  selectedItem.value = {
    id: item.motorcycleId,
    plate: item.plate,
    brand: item.brand,
    model: item.model
  }
  isInspectionModalOpen.value = true
}

const openMaintenanceModal = async (item: any) => {
  try {
    const fullMotorcycle = await $fetch<MotorcycleItem>(`/api/motorcycles/${item.motorcycleId}`)
    selectedMotorcycleForMaint.value = fullMotorcycle
    isMaintenanceModalOpen.value = true
  } catch {
    toast.error('Motor bilgisi yüklenemedi.')
  }
}

const onInspectionSaved = async () => {
  await refreshInspections()
  toast.success('Haftalık kontrol kaydedildi.')
}

const onMaintenanceSaved = async () => {
  await Promise.all([refreshInspections(), refreshMaintenance()])
  toast.success('Bakım kaydı başarıyla eklendi ve sonraki bakım aralığı hesaplandı.')
}

const formatDate = (date: string | Date | null | undefined) => {
  if (!date) return 'Hiç yapılmadı'
  try {
    return new Date(date).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch {
    return '-'
  }
}

const getOilLevelVariant = (level: OilLevelEnum) => {
  switch (level) {
    case 'NORMAL':
      return 'success'
    case 'LOW':
      return 'warning'
    case 'CRITICAL':
      return 'danger'
    default:
      return 'neutral'
  }
}

const getOilLevelLabel = (level: OilLevelEnum) => {
  switch (level) {
    case 'NORMAL':
      return 'Normal'
    case 'LOW':
      return 'Düşük'
    case 'CRITICAL':
      return 'Kritik'
    default:
      return level
  }
}

const getResultVariant = (res: InspectionResultEnum) => {
  switch (res) {
    case 'OK':
      return 'success'
    case 'MAINTENANCE_NEEDED':
      return 'warning'
    case 'URGENT_ACTION':
      return 'danger'
    default:
      return 'neutral'
  }
}

const getResultLabel = (res: InspectionResultEnum) => {
  switch (res) {
    case 'OK':
      return 'Sorun Yok'
    case 'MAINTENANCE_NEEDED':
      return 'Bakım Gerekli'
    case 'URGENT_ACTION':
      return 'Acil Müdahale'
    default:
      return res
  }
}
</script>
