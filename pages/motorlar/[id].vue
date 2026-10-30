<template>
  <div class="space-y-6">
    <!-- Geri Dön ve Başlık -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-center gap-3">
        <NuxtLink
          to="/motorlar"
          class="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs"
        >
          <ArrowLeft class="w-5 h-5" />
        </NuxtLink>
        <div>
          <div class="flex items-center gap-3">
            <h2 class="text-2xl font-extrabold text-slate-900 tracking-tight font-mono">
              {{ motorcycle?.plate }}
            </h2>
            <UiBadge :variant="getStatusBadgeVariant(motorcycle?.oilStatus)">
              {{ getStatusBadgeLabel(motorcycle?.oilStatus) }}
            </UiBadge>
          </div>
          <p class="text-sm text-slate-500 mt-0.5">
            {{ motorcycle?.brand }} {{ motorcycle?.model }}
          </p>
        </div>
      </div>

      <!-- İşlem Butonları -->
      <div class="flex items-center gap-2 flex-wrap">
        <!-- Bakım Yapıldı Butonu -->
        <button
          type="button"
          @click="isMaintenanceModalOpen = true"
          class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-2"
        >
          <Wrench class="w-4 h-4" />
          <span>Bakım Yapıldı</span>
        </button>

        <!-- Haftalık Kontrol Yap Butonu -->
        <button
          type="button"
          @click="isInspectionModalOpen = true"
          class="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold shadow-2xs flex items-center gap-2 transition-all"
        >
          <CheckCircle2 class="w-4 h-4 text-emerald-600" />
          <span>Haftalık Kontrol</span>
        </button>

        <!-- KM Güncelle -->
        <button
          type="button"
          @click="isKmModalOpen = true"
          class="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs flex items-center gap-2 transition-all"
        >
          <Gauge class="w-4 h-4 text-blue-600" />
          <span>KM Güncelle</span>
        </button>

        <!-- Düzenle -->
        <button
          type="button"
          @click="isEditModalOpen = true"
          class="px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs flex items-center gap-2 transition-all"
        >
          <Pencil class="w-3.5 h-3.5 text-slate-600" />
          <span>Düzenle</span>
        </button>
      </div>
    </div>

    <!-- Temel Metrik Kartları -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Güncel Kilometre -->
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Güncel Kilometre</p>
        <p class="text-2xl font-extrabold text-slate-900 mt-1 font-mono">
          {{ (motorcycle?.currentKm ?? 0).toLocaleString('tr-TR') }} KM
        </p>
        <p class="text-[11px] text-slate-400 mt-1">Sayaçtaki anlık değer</p>
      </div>

      <!-- Sonraki Yağ Bakımı -->
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sonraki Yağ Bakımı</p>
        <p class="text-2xl font-extrabold mt-1 font-mono" :class="getOilStatusTextColor(motorcycle?.oilStatus)">
          {{ (motorcycle?.nextOilChangeKm ?? 0).toLocaleString('tr-TR') }} KM
        </p>
        <p class="text-[11px] font-semibold mt-1" :class="getOilStatusTextColor(motorcycle?.oilStatus)">
          {{ formatRemainingKm(motorcycle?.remainingKm ?? 0) }}
        </p>
      </div>

      <!-- Sigorta Durumu -->
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Trafik Sigortası</p>
        <p class="text-lg font-bold text-slate-900 mt-1">
          {{ formatDate(motorcycle?.insuranceEndDate) }}
        </p>
        <p
          class="text-[11px] font-semibold mt-1"
          :class="{
            'text-emerald-600': motorcycle?.insuranceStatus === 'active',
            'text-amber-600': motorcycle?.insuranceStatus === 'upcoming',
            'text-rose-600': motorcycle?.insuranceStatus === 'expired'
          }"
        >
          {{ formatDaysLeft(motorcycle?.insuranceDaysLeft) }}
        </p>
      </div>

      <!-- Muayene Durumu -->
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">TÜVTÜRK Muayene</p>
        <p class="text-lg font-bold text-slate-900 mt-1">
          {{ formatDate(motorcycle?.inspectionExpiryDate) }}
        </p>
        <p
          class="text-[11px] font-semibold mt-1"
          :class="{
            'text-emerald-600': motorcycle?.inspectionStatus === 'valid',
            'text-amber-600': motorcycle?.inspectionStatus === 'upcoming',
            'text-rose-600': motorcycle?.inspectionStatus === 'expired'
          }"
        >
          {{ formatDaysLeft(motorcycle?.inspectionDaysLeft) }}
        </p>
      </div>
    </div>

    <!-- Detaylı Bilgiler ve Notlar -->
    <div class="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
      <h3 class="text-base font-bold text-slate-900">Araç ve Bakım Konfigürasyonu</h3>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
        <div>
          <span class="block text-xs font-medium text-slate-400">Son Bakım Kilometresi</span>
          <span class="font-bold text-slate-800 font-mono mt-0.5 block">
            {{ (motorcycle?.lastOilChangeKm ?? 0).toLocaleString('tr-TR') }} KM
          </span>
        </div>
        <div>
          <span class="block text-xs font-medium text-slate-400">Son Bakım Tarihi</span>
          <span class="font-bold text-slate-800 mt-0.5 block">
            {{ formatDate(motorcycle?.lastOilChangeDate) }}
          </span>
        </div>
        <div>
          <span class="block text-xs font-medium text-slate-400">Bakım Periyodu Aralığı</span>
          <span class="font-bold text-slate-800 font-mono mt-0.5 block">
            {{ (motorcycle?.oilChangeIntervalKm ?? 3000).toLocaleString('tr-TR') }} KM
          </span>
        </div>
      </div>

      <div v-if="motorcycle?.notes" class="pt-4 border-t border-slate-100">
        <span class="block text-xs font-medium text-slate-400 mb-1">Filo Notları</span>
        <p class="text-sm text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 leading-relaxed">
          {{ motorcycle.notes }}
        </p>
      </div>
    </div>

    <!-- TABLAR: BAKIM GEÇMİŞİ & HAFTALIK KONTROLLER (Section 9) -->
    <div class="space-y-4">
      <div class="flex items-center justify-between border-b border-slate-200 pb-3">
        <div class="flex items-center gap-3">
          <button
            type="button"
            @click="activeSubTab = 'maintenance'"
            class="text-sm font-bold pb-2 relative transition-colors"
            :class="activeSubTab === 'maintenance' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'"
          >
            Bakım Geçmişi ({{ maintenanceRecords.length }})
            <span
              v-if="activeSubTab === 'maintenance'"
              class="absolute bottom-[-13px] inset-x-0 h-0.5 bg-blue-600"
            />
          </button>

          <button
            type="button"
            @click="activeSubTab = 'inspections'"
            class="text-sm font-bold pb-2 relative transition-colors"
            :class="activeSubTab === 'inspections' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'"
          >
            Haftalık Kontroller ({{ weeklyInspections.length }})
            <span
              v-if="activeSubTab === 'inspections'"
              class="absolute bottom-[-13px] inset-x-0 h-0.5 bg-blue-600"
            />
          </button>
        </div>

        <button
          v-if="activeSubTab === 'maintenance'"
          type="button"
          @click="isMaintenanceModalOpen = true"
          class="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <Plus class="w-4 h-4" />
          <span>Yeni Bakım Ekle</span>
        </button>

        <button
          v-else
          type="button"
          @click="isInspectionModalOpen = true"
          class="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <Plus class="w-4 h-4" />
          <span>Kontrol Ekle</span>
        </button>
      </div>

      <!-- Bakım Geçmişi Listesi -->
      <div v-if="activeSubTab === 'maintenance'">
        <MaintenanceMaintenanceHistoryList :records="maintenanceRecords" />
      </div>

      <!-- Haftalık Kontrol Geçmişi Listesi -->
      <div v-else-if="activeSubTab === 'inspections'">
        <MaintenanceInspectionHistoryList :inspections="weeklyInspections" />
      </div>
    </div>

    <!-- Modallar -->
    <MotorcyclesMotorcycleFormModal
      v-model="isEditModalOpen"
      :motorcycle="motorcycle"
      @saved="refreshAll"
    />

    <MotorcyclesQuickKmModal
      v-model="isKmModalOpen"
      :motorcycle="motorcycle"
      @saved="refreshAll"
    />

    <MaintenanceMaintenanceModal
      v-model="isMaintenanceModalOpen"
      :motorcycle="motorcycle"
      @saved="onMaintenanceSaved"
    />

    <MaintenanceWeeklyInspectionModal
      v-model="isInspectionModalOpen"
      :motorcycle="motorcycle"
      @saved="onInspectionSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, Gauge, Pencil, Wrench, CheckCircle2, Plus } from 'lucide-vue-next'
import { useToast } from '~/composables/useToast'
import type { MotorcycleItem, MaintenanceRecordItem, WeeklyInspectionItem } from '~/shared/types'

const route = useRoute()
const id = route.params.id as string
const toast = useToast()

const activeSubTab = ref<'maintenance' | 'inspections'>('maintenance')

const isEditModalOpen = ref(false)
const isKmModalOpen = ref(false)
const isMaintenanceModalOpen = ref(false)
const isInspectionModalOpen = ref(false)

// Motor bilgisi
const { data: motorcycle, refresh: refreshMotorcycle } = await useFetch<MotorcycleItem>(`/api/motorcycles/${id}`)

// Bakım kayıtları
const { data: maintenanceRecordsData, refresh: refreshMaintenance } = await useFetch<MaintenanceRecordItem[]>(
  `/api/motorcycles/${id}/maintenance`
)
const maintenanceRecords = computed(() => maintenanceRecordsData.value ?? [])

// Haftalık kontrol kayıtları
const { data: weeklyInspectionsData, refresh: refreshInspections } = await useFetch<WeeklyInspectionItem[]>(
  `/api/motorcycles/${id}/inspections`
)
const weeklyInspections = computed(() => weeklyInspectionsData.value ?? [])

const refreshAll = async () => {
  await Promise.all([
    refreshMotorcycle(),
    refreshMaintenance(),
    refreshInspections()
  ])
}

const onMaintenanceSaved = async () => {
  await refreshAll()
  toast.success('Bakım kaydı başarıyla oluşturuldu ve sonraki bakım aralığı hesaplandı.')
}

const onInspectionSaved = async () => {
  await refreshAll()
  toast.success('Haftalık kontrol başarıyla kaydedildi.')
}

const formatDate = (date: string | Date | null | undefined) => {
  if (!date) return '-'
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

const formatRemainingKm = (km: number) => {
  if (km < 0) return `${Math.abs(km).toLocaleString('tr-TR')} KM aşım yapıldı!`
  return `${km.toLocaleString('tr-TR')} KM kaldı`
}

const formatDaysLeft = (days: number | null | undefined) => {
  if (days === null || days === undefined) return 'Tarih belirtilmedi'
  if (days < 0) return `${Math.abs(days)} gün geçti`
  if (days === 0) return 'Bugün son gün'
  return `${days} gün kaldı`
}

const getStatusBadgeVariant = (status?: string) => {
  switch (status) {
    case 'ok':
      return 'success'
    case 'upcoming':
      return 'warning'
    case 'overdue':
      return 'danger'
    default:
      return 'neutral'
  }
}

const getStatusBadgeLabel = (status?: string) => {
  switch (status) {
    case 'ok':
      return 'Normal'
    case 'upcoming':
      return 'Bakım Yaklaştı'
    case 'overdue':
      return 'Bakım Gecikti'
    default:
      return 'Bilinmiyor'
  }
}

const getOilStatusTextColor = (status?: string) => {
  switch (status) {
    case 'ok':
      return 'text-emerald-600'
    case 'upcoming':
      return 'text-amber-600'
    case 'overdue':
      return 'text-rose-600'
    default:
      return 'text-slate-800'
  }
}
</script>
