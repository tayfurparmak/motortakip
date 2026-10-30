<template>
  <div class="space-y-6">
    <!-- Başlık ve Eylemler -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 class="text-2xl font-extrabold text-slate-900 tracking-tight">Sigorta ve Muayene Takip Merkezi</h2>
        <p class="text-sm text-slate-500 mt-1">
          Zorunlu trafik sigortaları ve TÜVTÜRK periyodik muayene sürelerini izleyin, cezaların önüne geçin.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          @click="refreshData"
          :disabled="isRefreshing"
          class="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs flex items-center gap-2 transition-all disabled:opacity-50"
        >
          <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': isRefreshing }" />
          <span>Yenile</span>
        </button>
      </div>
    </div>

    <!-- Özet Durum Kartları -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Sigortası Yaklaşan -->
      <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sigortası Yaklaşan</p>
          <p class="text-2xl font-extrabold text-amber-600 mt-1">
            {{ counts.upcomingInsurance }}
          </p>
          <p class="text-[11px] text-amber-700/80 font-medium mt-1">0–30 gün içinde yenileme</p>
        </div>
        <div class="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <ShieldAlert class="w-6 h-6" />
        </div>
      </div>

      <!-- Sigortası Biten (Dolmuş) -->
      <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sigortası Biten</p>
          <p class="text-2xl font-extrabold text-rose-600 mt-1">
            {{ counts.expiredInsurance }}
          </p>
          <p class="text-[11px] text-rose-700/80 font-medium mt-1">Poliçesi gecikmiş araçlar</p>
        </div>
        <div class="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
          <AlertTriangle class="w-6 h-6" />
        </div>
      </div>

      <!-- Muayenesi Yaklaşan -->
      <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Muayenesi Yaklaşan</p>
          <p class="text-2xl font-extrabold text-purple-600 mt-1">
            {{ counts.upcomingInspection }}
          </p>
          <p class="text-[11px] text-purple-700/80 font-medium mt-1">Randevu alınması gereken</p>
        </div>
        <div class="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
          <FileCheck class="w-6 h-6" />
        </div>
      </div>

      <!-- Muayenesi Geçen -->
      <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Muayenesi Geçen</p>
          <p class="text-2xl font-extrabold text-rose-600 mt-1">
            {{ counts.expiredInspection }}
          </p>
          <p class="text-[11px] text-rose-700/80 font-medium mt-1">Trafiğe çıkışı riskli araçlar</p>
        </div>
        <div class="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
          <AlertCircle class="w-6 h-6" />
        </div>
      </div>
    </div>

    <!-- Tablo ve Filtreleme Kartı -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <!-- Filtreleme Butonları & Arama Barı -->
      <div class="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-slate-50/50">
        <!-- Arama Input -->
        <div class="relative flex-1 max-w-sm">
          <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Plaka veya model ara..."
            class="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white placeholder:text-slate-400"
          />
        </div>

        <!-- Filtre Sekmeleri -->
        <div class="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-200/60 rounded-xl shrink-0">
          <button
            type="button"
            @click="filterMode = 'all'"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            :class="filterMode === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'"
          >
            Tüm Filo
          </button>
          <button
            type="button"
            @click="filterMode = 'insurance_alert'"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1"
            :class="filterMode === 'insurance_alert' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'"
          >
            <span>Sigorta Uyarısı</span>
            <span
              v-if="counts.upcomingInsurance + counts.expiredInsurance > 0"
              class="w-2 h-2 rounded-full bg-amber-500"
            />
          </button>
          <button
            type="button"
            @click="filterMode = 'inspection_alert'"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1"
            :class="filterMode === 'inspection_alert' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'"
          >
            <span>Muayene Uyarısı</span>
            <span
              v-if="counts.upcomingInspection + counts.expiredInspection > 0"
              class="w-2 h-2 rounded-full bg-purple-500"
            />
          </button>
          <button
            type="button"
            @click="filterMode = 'missing'"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            :class="filterMode === 'missing' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'"
          >
            Eksik Evrak
          </button>
        </div>
      </div>

      <!-- Tablo Alanı -->
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs sm:text-sm border-collapse">
          <thead>
            <tr class="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th class="py-3.5 px-4 sm:px-6">Plaka</th>
              <th class="py-3.5 px-4">Model</th>
              <th class="py-3.5 px-4">Sigorta Başlangıç</th>
              <th class="py-3.5 px-4">Sigorta Bitiş</th>
              <th class="py-3.5 px-4">Sigorta Durumu</th>
              <th class="py-3.5 px-4">Muayene Bitiş</th>
              <th class="py-3.5 px-4">Muayene Durumu</th>
              <th class="py-3.5 px-4 sm:px-6 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-if="pending">
              <td colspan="8" class="py-12 text-center">
                <UiLoadingSpinner text="Evrak kayıtları listeleniyor..." />
              </td>
            </tr>

            <tr v-else-if="filteredMotorcycles.length === 0">
              <td colspan="8" class="py-12 text-center text-slate-500">
                <ShieldCheck class="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p class="font-medium text-slate-700">Seçili kritere uygun evrak kaydı bulunamadı</p>
                <p class="text-xs text-slate-400 mt-0.5">Tüm filo belgeleri güncel olabilir veya arama sonucunda araç bulunamadı.</p>
              </td>
            </tr>

            <tr
              v-for="motorcycle in filteredMotorcycles"
              :key="motorcycle.id"
              class="hover:bg-slate-50/80 transition-colors"
            >
              <!-- Plaka -->
              <td class="py-4 px-4 sm:px-6 font-mono font-bold text-slate-900 whitespace-nowrap">
                <NuxtLink
                  :to="`/motorlar/${motorcycle.id}`"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 hover:border-blue-400 hover:text-blue-600 transition-colors"
                >
                  <span>{{ motorcycle.plate }}</span>
                </NuxtLink>
              </td>

              <!-- Model -->
              <td class="py-4 px-4 whitespace-nowrap font-medium text-slate-800">
                {{ motorcycle.brand }} {{ motorcycle.model }}
              </td>

              <!-- Sigorta Başlangıç -->
              <td class="py-4 px-4 whitespace-nowrap text-xs text-slate-600">
                {{ formatDate(motorcycle.insuranceStartDate) }}
              </td>

              <!-- Sigorta Bitiş & Kalan Gün -->
              <td class="py-4 px-4 whitespace-nowrap text-xs">
                <div v-if="motorcycle.insuranceEndDate">
                  <span class="font-bold text-slate-900 block">{{ formatDate(motorcycle.insuranceEndDate) }}</span>
                  <span
                    class="text-[11px] font-semibold mt-0.5 block"
                    :class="{
                      'text-emerald-600': motorcycle.insuranceStatus === 'active',
                      'text-amber-600': motorcycle.insuranceStatus === 'upcoming',
                      'text-rose-600': motorcycle.insuranceStatus === 'expired'
                    }"
                  >
                    {{ formatDaysLeft(motorcycle.insuranceDaysLeft) }}
                  </span>
                </div>
                <span v-else class="text-slate-400 italic">-</span>
              </td>

              <!-- Sigorta Durumu -->
              <td class="py-4 px-4 whitespace-nowrap">
                <UiBadge :variant="getDocBadgeVariant(motorcycle.insuranceStatus)">
                  {{ getInsuranceStatusLabel(motorcycle.insuranceStatus) }}
                </UiBadge>
              </td>

              <!-- Muayene Bitiş & Kalan Gün -->
              <td class="py-4 px-4 whitespace-nowrap text-xs">
                <div v-if="motorcycle.inspectionExpiryDate">
                  <span class="font-bold text-slate-900 block">{{ formatDate(motorcycle.inspectionExpiryDate) }}</span>
                  <span
                    class="text-[11px] font-semibold mt-0.5 block"
                    :class="{
                      'text-emerald-600': motorcycle.inspectionStatus === 'valid',
                      'text-amber-600': motorcycle.inspectionStatus === 'upcoming',
                      'text-rose-600': motorcycle.inspectionStatus === 'expired'
                    }"
                  >
                    {{ formatDaysLeft(motorcycle.inspectionDaysLeft) }}
                  </span>
                </div>
                <span v-else class="text-slate-400 italic">-</span>
              </td>

              <!-- Muayene Durumu -->
              <td class="py-4 px-4 whitespace-nowrap">
                <UiBadge :variant="getDocBadgeVariant(motorcycle.inspectionStatus)">
                  {{ getInspectionStatusLabel(motorcycle.inspectionStatus) }}
                </UiBadge>
              </td>

              <!-- İşlemler -->
              <td class="py-4 px-4 sm:px-6 whitespace-nowrap text-right">
                <div class="flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    @click="openDocumentsModal(motorcycle)"
                    class="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-400 bg-white text-slate-700 hover:text-blue-600 text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
                  >
                    <Calendar class="w-3.5 h-3.5 text-blue-600" />
                    <span>Tarih Güncelle</span>
                  </button>

                  <NuxtLink
                    :to="`/motorlar/${motorcycle.id}`"
                    class="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                    title="Detaya Git"
                  >
                    <ChevronRight class="w-4 h-4" />
                  </NuxtLink>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Tarih Güncelleme Modalı -->
    <MotorcyclesDocumentsModal
      v-model="isDocsModalOpen"
      :motorcycle="selectedMotorcycle"
      @saved="onSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  ShieldAlert,
  ShieldCheck,
  FileCheck,
  AlertTriangle,
  AlertCircle,
  Search,
  RefreshCw,
  Calendar,
  ChevronRight
} from 'lucide-vue-next'
import { useToast } from '~/composables/useToast'
import type { MotorcycleItem } from '~/shared/types'

const toast = useToast()

const searchQuery = ref('')
const filterMode = ref<'all' | 'insurance_alert' | 'inspection_alert' | 'missing'>('all')
const isRefreshing = ref(false)

const isDocsModalOpen = ref(false)
const selectedMotorcycle = ref<MotorcycleItem | null>(null)

const { data: motorcyclesData, pending, refresh } = await useFetch<{
  items: MotorcycleItem[]
}>('/api/motorcycles')

const motorcycles = computed(() => motorcyclesData.value?.items ?? [])

const counts = computed(() => {
  let upcomingInsurance = 0
  let expiredInsurance = 0
  let upcomingInspection = 0
  let expiredInspection = 0

  for (const m of motorcycles.value) {
    if (m.insuranceStatus === 'upcoming') upcomingInsurance++
    if (m.insuranceStatus === 'expired') expiredInsurance++
    if (m.inspectionStatus === 'upcoming') upcomingInspection++
    if (m.inspectionStatus === 'expired') expiredInspection++
  }

  return {
    upcomingInsurance,
    expiredInsurance,
    upcomingInspection,
    expiredInspection
  }
})

const filteredMotorcycles = computed(() => {
  return motorcycles.value.filter((m) => {
    // Arama
    if (searchQuery.value) {
      const q = searchQuery.value.toLocaleLowerCase('tr-TR').trim()
      const matchesPlate = m.plate.toLocaleLowerCase('tr-TR').includes(q)
      const matchesBrand = m.brand.toLocaleLowerCase('tr-TR').includes(q)
      const matchesModel = m.model.toLocaleLowerCase('tr-TR').includes(q)
      if (!matchesPlate && !matchesBrand && !matchesModel) return false
    }

    // Filtre modu
    if (filterMode.value === 'insurance_alert') {
      return m.insuranceStatus === 'upcoming' || m.insuranceStatus === 'expired'
    }

    if (filterMode.value === 'inspection_alert') {
      return m.inspectionStatus === 'upcoming' || m.inspectionStatus === 'expired'
    }

    if (filterMode.value === 'missing') {
      return m.insuranceStatus === 'missing' || m.inspectionStatus === 'missing'
    }

    return true
  })
})

const openDocumentsModal = (m: MotorcycleItem) => {
  selectedMotorcycle.value = m
  isDocsModalOpen.value = true
}

const onSaved = async () => {
  await refresh()
  toast.success('Resmi belge tarihleri başarıyla güncellendi.')
}

const refreshData = async () => {
  isRefreshing.value = true
  try {
    await refresh()
    toast.info('Veriler güncellendi.')
  } finally {
    isRefreshing.value = false
  }
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

const formatDaysLeft = (days: number | null | undefined) => {
  if (days === null || days === undefined) return '-'
  if (days < 0) return `${Math.abs(days)} gün geçti!`
  if (days === 0) return 'Bugün doluyor!'
  return `${days} gün kaldı`
}

const getDocBadgeVariant = (status?: string) => {
  switch (status) {
    case 'active':
    case 'valid':
      return 'success'
    case 'upcoming':
      return 'warning'
    case 'expired':
      return 'danger'
    default:
      return 'neutral'
  }
}

const getInsuranceStatusLabel = (status?: string) => {
  switch (status) {
    case 'active':
      return 'Aktif'
    case 'upcoming':
      return 'Yaklaşıyor'
    case 'expired':
      return 'Süresi Doldu'
    case 'missing':
      return 'Bilgi Eksik'
    default:
      return '-'
  }
}

const getInspectionStatusLabel = (status?: string) => {
  switch (status) {
    case 'valid':
      return 'Geçerli'
    case 'upcoming':
      return 'Yaklaşıyor'
    case 'expired':
      return 'Süresi Doldu'
    case 'missing':
      return 'Bilgi Eksik'
    default:
      return '-'
  }
}
</script>
