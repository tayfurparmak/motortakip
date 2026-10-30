<template>
  <div class="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col">
    <!-- Tablo Üst Arama ve Filtreleme Barı -->
    <div class="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-slate-50/40">
      <!-- Arama Input -->
      <div class="relative flex-1 max-w-md">
        <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Plaka, marka veya model ile ara..."
          class="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white transition-all placeholder:text-slate-400 shadow-2xs"
        />
        <button
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Filtreler ve Ekle Butonu -->
      <div class="flex items-center gap-2.5 flex-wrap">
        <!-- Durum Filtresi -->
        <select
          v-model="statusFilter"
          class="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
        >
          <option value="all">Tüm Bakım Durumları</option>
          <option value="ok">Normal (500+ KM)</option>
          <option value="upcoming">Bakım Yaklaştı (0-500 KM)</option>
          <option value="overdue">Bakım Gecikti (Aşım)</option>
        </select>

        <!-- Yeni Motor Butonu -->
        <button
          type="button"
          @click="$emit('add')"
          class="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-xs shadow-blue-500/20 transition-all flex items-center gap-2 shrink-0"
        >
          <Plus class="w-4 h-4" />
          <span>Yeni Motor Ekle</span>
        </button>
      </div>
    </div>

    <!-- Tablo Alanı -->
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs sm:text-sm border-collapse">
        <thead>
          <tr class="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <th class="py-3.5 px-4 sm:px-6">Plaka</th>
            <th class="py-3.5 px-4">Marka & Model</th>
            <th class="py-3.5 px-4">Güncel KM</th>
            <th class="py-3.5 px-4">Son Yağ Bakımı</th>
            <th class="py-3.5 px-4">Sonraki Bakım</th>
            <th class="py-3.5 px-4">Sigorta</th>
            <th class="py-3.5 px-4">Muayene</th>
            <th class="py-3.5 px-4">Durum</th>
            <th class="py-3.5 px-4 sm:px-6 text-right">İşlemler</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <!-- Yükleniyor Durumu -->
          <tr v-if="loading">
            <td colspan="9" class="py-12 text-center">
              <UiLoadingSpinner text="Motorlar listeleniyor..." />
            </td>
          </tr>

          <!-- Boş Liste Durumu -->
          <tr v-else-if="filteredMotorcycles.length === 0">
            <td colspan="9" class="py-12 text-center text-slate-500">
              <div class="max-w-xs mx-auto space-y-2">
                <Bike class="w-10 h-10 text-slate-300 mx-auto" />
                <p class="font-medium text-slate-700">Kayıtlı motor bulunamadı</p>
                <p class="text-xs text-slate-400">Arama kriterlerinizi değiştirebilir veya yeni motor ekleyebilirsiniz.</p>
              </div>
            </td>
          </tr>

          <!-- Motor Satırları -->
          <tr
            v-for="motorcycle in filteredMotorcycles"
            :key="motorcycle.id"
            class="hover:bg-blue-50/20 transition-colors group"
          >
            <!-- Otantik TR Plaka Rozeti -->
            <td class="py-4 px-4 sm:px-6 whitespace-nowrap">
              <NuxtLink
                :to="`/motorlar/${motorcycle.id}`"
                class="inline-flex items-center overflow-hidden rounded-md border border-slate-300 shadow-2xs font-mono font-bold text-xs bg-white hover:border-blue-500 transition-colors"
                title="Detayları İncele"
              >
                <span class="bg-blue-600 text-white px-1.5 py-0.5 text-[9px] font-sans font-black tracking-tighter">TR</span>
                <span class="px-2 py-0.5 text-slate-900 tracking-wider">{{ motorcycle.plate }}</span>
              </NuxtLink>
            </td>

            <!-- Marka & Model -->
            <td class="py-4 px-4 whitespace-nowrap">
              <div class="font-bold text-slate-900">{{ motorcycle.brand }} {{ motorcycle.model }}</div>
              <div v-if="motorcycle.notes" class="text-[11px] text-slate-400 truncate max-w-[170px]">{{ motorcycle.notes }}</div>
            </td>

            <!-- Güncel KM -->
            <td class="py-4 px-4 whitespace-nowrap">
              <div class="flex items-center gap-1.5">
                <span class="font-mono font-extrabold text-slate-900">
                  {{ motorcycle.currentKm.toLocaleString('tr-TR') }}
                </span>
                <span class="text-xs font-medium text-slate-400">KM</span>
                <button
                  type="button"
                  title="KM Güncelle"
                  @click="$emit('quick-km', motorcycle)"
                  class="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-600 rounded transition-all"
                >
                  <Pencil class="w-3.5 h-3.5" />
                </button>
              </div>
            </td>

            <!-- Son Yağ Bakımı -->
            <td class="py-4 px-4 whitespace-nowrap text-xs">
              <div class="font-medium text-slate-800">
                {{ (motorcycle.lastOilChangeKm ?? 0).toLocaleString('tr-TR') }} KM
              </div>
              <div class="text-[11px] text-slate-400">
                {{ formatDate(motorcycle.lastOilChangeDate) }}
              </div>
            </td>

            <!-- Sonraki Bakım -->
            <td class="py-4 px-4 whitespace-nowrap text-xs">
              <div class="font-bold text-slate-900 font-mono">
                {{ motorcycle.nextOilChangeKm.toLocaleString('tr-TR') }} KM
              </div>
              <div
                class="text-[11px] font-bold"
                :class="{
                  'text-emerald-600': motorcycle.oilStatus === 'ok',
                  'text-amber-600': motorcycle.oilStatus === 'upcoming',
                  'text-rose-600': motorcycle.oilStatus === 'overdue'
                }"
              >
                {{ formatRemainingKm(motorcycle.remainingKm) }}
              </div>
            </td>

            <!-- Sigorta -->
            <td class="py-4 px-4 whitespace-nowrap text-xs">
              <div v-if="motorcycle.insuranceEndDate">
                <div class="font-medium text-slate-800">{{ formatDate(motorcycle.insuranceEndDate) }}</div>
                <div
                  class="text-[11px] font-bold"
                  :class="{
                    'text-emerald-600': motorcycle.insuranceStatus === 'active',
                    'text-amber-600': motorcycle.insuranceStatus === 'upcoming',
                    'text-rose-600': motorcycle.insuranceStatus === 'expired'
                  }"
                >
                  {{ formatDaysLeft(motorcycle.insuranceDaysLeft) }}
                </div>
              </div>
              <span v-else class="text-slate-400 italic text-[11px]">-</span>
            </td>

            <!-- Muayene -->
            <td class="py-4 px-4 whitespace-nowrap text-xs">
              <div v-if="motorcycle.inspectionExpiryDate">
                <div class="font-medium text-slate-800">{{ formatDate(motorcycle.inspectionExpiryDate) }}</div>
                <div
                  class="text-[11px] font-bold"
                  :class="{
                    'text-emerald-600': motorcycle.inspectionStatus === 'valid',
                    'text-amber-600': motorcycle.inspectionStatus === 'upcoming',
                    'text-rose-600': motorcycle.inspectionStatus === 'expired'
                  }"
                >
                  {{ formatDaysLeft(motorcycle.inspectionDaysLeft) }}
                </div>
              </div>
              <span v-else class="text-slate-400 italic text-[11px]">-</span>
            </td>

            <!-- Durum Rozeti -->
            <td class="py-4 px-4 whitespace-nowrap">
              <UiBadge :variant="getStatusBadgeVariant(motorcycle.oilStatus)">
                {{ getStatusBadgeLabel(motorcycle.oilStatus) }}
              </UiBadge>
            </td>

            <!-- İşlemler -->
            <td class="py-4 px-4 sm:px-6 whitespace-nowrap text-right">
              <div class="flex items-center justify-end gap-1">
                <!-- Bakım Yapıldı Butonu -->
                <button
                  type="button"
                  @click="$emit('maintenance', motorcycle)"
                  class="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  title="Bakım Yapıldı Kaydı Ekle"
                >
                  <Wrench class="w-4 h-4" />
                </button>

                <!-- Haftalık Kontrol Yap Butonu -->
                <button
                  type="button"
                  @click="$emit('inspection', motorcycle)"
                  class="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                  title="Haftalık Kontrol Kaydı Ekle"
                >
                  <CheckCircle2 class="w-4 h-4" />
                </button>

                <!-- Detay -->
                <NuxtLink
                  :to="`/motorlar/${motorcycle.id}`"
                  class="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  title="Motor Detayı & Geçmiş"
                >
                  <Eye class="w-4 h-4" />
                </NuxtLink>

                <!-- Hızlı KM -->
                <button
                  type="button"
                  @click="$emit('quick-km', motorcycle)"
                  class="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  title="Kilometre Güncelle"
                >
                  <Gauge class="w-4 h-4" />
                </button>

                <!-- Düzenle -->
                <button
                  type="button"
                  @click="$emit('edit', motorcycle)"
                  class="p-2 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                  title="Düzenle"
                >
                  <Pencil class="w-4 h-4" />
                </button>

                <!-- Sil / Arşivle -->
                <button
                  type="button"
                  @click="$emit('archive', motorcycle)"
                  class="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Arşivle / Sil"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Search,
  Plus,
  Bike,
  Pencil,
  Gauge,
  Eye,
  Trash2,
  Wrench,
  CheckCircle2,
  X
} from 'lucide-vue-next'
import type { MotorcycleItem } from '~/shared/types'

const props = defineProps<{
  motorcycles: MotorcycleItem[]
  loading?: boolean
}>()

defineEmits<{
  (e: 'add'): void
  (e: 'edit', motorcycle: MotorcycleItem): void
  (e: 'quick-km', motorcycle: MotorcycleItem): void
  (e: 'maintenance', motorcycle: MotorcycleItem): void
  (e: 'inspection', motorcycle: MotorcycleItem): void
  (e: 'archive', motorcycle: MotorcycleItem): void
}>()

const searchQuery = ref('')
const statusFilter = ref('all')

const filteredMotorcycles = computed(() => {
  return props.motorcycles.filter((m) => {
    // Arama
    if (searchQuery.value) {
      const q = searchQuery.value.toLocaleLowerCase('tr-TR').trim()
      const matchesPlate = m.plate.toLocaleLowerCase('tr-TR').includes(q)
      const matchesBrand = m.brand.toLocaleLowerCase('tr-TR').includes(q)
      const matchesModel = m.model.toLocaleLowerCase('tr-TR').includes(q)
      if (!matchesPlate && !matchesBrand && !matchesModel) return false
    }

    // Durum filtresi
    if (statusFilter.value !== 'all') {
      if (m.oilStatus !== statusFilter.value) return false
    }

    return true
  })
})

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
  if (km < 0) {
    return `${Math.abs(km).toLocaleString('tr-TR')} KM aşıldı`
  }
  return `${km.toLocaleString('tr-TR')} KM kaldı`
}

const formatDaysLeft = (days: number | null | undefined) => {
  if (days === null || days === undefined) return '-'
  if (days < 0) {
    return `${Math.abs(days)} gün geçti`
  }
  if (days === 0) {
    return 'Bugün son gün'
  }
  return `${days} gün kaldı`
}

const getStatusBadgeVariant = (status: string) => {
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

const getStatusBadgeLabel = (status: string) => {
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
</script>
