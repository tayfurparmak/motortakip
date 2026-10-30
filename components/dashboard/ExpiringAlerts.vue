<template>
  <div v-if="expiringItems.length > 0" class="space-y-3">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <AlertTriangle class="w-5 h-5 text-amber-600" />
        <h3 class="text-sm font-bold text-slate-900">Yaklaşan ve Süresi Dolan Resmi Belgeler</h3>
      </div>
      <NuxtLink
        to="/sigorta-muayene"
        class="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
      >
        <span>Tümünü Gör ({{ expiringItems.length }})</span>
        <ChevronRight class="w-3.5 h-3.5" />
      </NuxtLink>
    </div>

    <!-- Uyarı Kartları Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      <div
        v-for="item in expiringItems.slice(0, 6)"
        :key="item.key"
        class="p-4 rounded-xl border flex items-center justify-between gap-3 bg-white shadow-2xs hover:shadow-xs transition-shadow"
        :class="{
          'border-rose-200 bg-rose-50/20': item.type === 'expired',
          'border-amber-200 bg-amber-50/20': item.type === 'upcoming'
        }"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            :class="{
              'bg-rose-100 text-rose-700': item.type === 'expired',
              'bg-amber-100 text-amber-700': item.type === 'upcoming'
            }"
          >
            <ShieldAlert v-if="item.docType === 'Sigorta'" class="w-5 h-5" />
            <FileCheck v-else class="w-5 h-5" />
          </div>

          <div>
            <div class="flex items-center gap-2">
              <span class="font-mono font-bold text-xs text-slate-900">{{ item.plate }}</span>
              <span class="text-[11px] font-semibold text-slate-500">{{ item.docType }}</span>
            </div>
            <p
              class="text-xs font-bold mt-0.5"
              :class="item.type === 'expired' ? 'text-rose-700' : 'text-amber-700'"
            >
              {{ item.statusText }}
            </p>
            <p class="text-[10px] text-slate-400 mt-0.5">{{ formatDate(item.date) }}</p>
          </div>
        </div>

        <button
          type="button"
          @click="$emit('update-doc', item.motorcycle)"
          class="px-2.5 py-1.5 rounded-lg border text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 transition-colors shrink-0 shadow-2xs"
        >
          Yenile
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { AlertTriangle, ChevronRight, ShieldAlert, FileCheck } from 'lucide-vue-next'
import type { MotorcycleItem } from '~/shared/types'

const props = defineProps<{
  motorcycles: MotorcycleItem[]
}>()

defineEmits<{
  (e: 'update-doc', motorcycle: MotorcycleItem): void
}>()

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

const expiringItems = computed(() => {
  const items: Array<{
    key: string
    plate: string
    docType: 'Sigorta' | 'Muayene'
    type: 'expired' | 'upcoming'
    statusText: string
    date: string | Date
    motorcycle: MotorcycleItem
  }> = []

  for (const m of props.motorcycles) {
    // Sigorta kontrolü
    if (m.insuranceStatus === 'expired') {
      items.push({
        key: `${m.id}-ins-exp`,
        plate: m.plate,
        docType: 'Sigorta',
        type: 'expired',
        statusText: `${Math.abs(m.insuranceDaysLeft ?? 0)} gün önce doldu!`,
        date: m.insuranceEndDate!,
        motorcycle: m
      })
    } else if (m.insuranceStatus === 'upcoming') {
      items.push({
        key: `${m.id}-ins-up`,
        plate: m.plate,
        docType: 'Sigorta',
        type: 'upcoming',
        statusText: m.insuranceDaysLeft === 0 ? 'Bugün doluyor!' : `${m.insuranceDaysLeft} gün kaldı`,
        date: m.insuranceEndDate!,
        motorcycle: m
      })
    }

    // Muayene kontrolü
    if (m.inspectionStatus === 'expired') {
      items.push({
        key: `${m.id}-insp-exp`,
        plate: m.plate,
        docType: 'Muayene',
        type: 'expired',
        statusText: `${Math.abs(m.inspectionDaysLeft ?? 0)} gün önce doldu!`,
        date: m.inspectionExpiryDate!,
        motorcycle: m
      })
    } else if (m.inspectionStatus === 'upcoming') {
      items.push({
        key: `${m.id}-insp-up`,
        plate: m.plate,
        docType: 'Muayene',
        type: 'upcoming',
        statusText: m.inspectionDaysLeft === 0 ? 'Bugün doluyor!' : `${m.inspectionDaysLeft} gün kaldı`,
        date: m.inspectionExpiryDate!,
        motorcycle: m
      })
    }
  }

  // Önce süresi dolanlar (en acil), sonra yaklaşanlar
  return items.sort((a, b) => {
    if (a.type === 'expired' && b.type !== 'expired') return -1
    if (a.type !== 'expired' && b.type === 'expired') return 1
    return 0
  })
})
</script>

