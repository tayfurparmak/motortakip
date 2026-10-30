<template>
  <div class="space-y-3">
    <div v-if="inspections.length === 0" class="p-8 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200/60">
      <CheckCircle2 class="w-8 h-8 text-slate-300 mx-auto mb-2" />
      <p class="text-sm font-semibold text-slate-700">Henüz haftalık kontrol kaydı bulunmuyor</p>
      <p class="text-xs text-slate-400 mt-1">Yağ seviyesi ve mekanik kontroller yapıldığında buradan takip edebilirsiniz.</p>
    </div>

    <div v-else class="divide-y divide-slate-100 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
      <div
        v-for="inspection in inspections"
        :key="inspection.id"
        class="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
      >
        <div class="flex items-start gap-3.5">
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
            :class="{
              'bg-emerald-50 text-emerald-600': inspection.result === 'OK',
              'bg-amber-50 text-amber-600': inspection.result === 'MAINTENANCE_NEEDED',
              'bg-rose-50 text-rose-600': inspection.result === 'URGENT_ACTION'
            }"
          >
            <Activity class="w-5 h-5" />
          </div>

          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-bold text-sm text-slate-900">
                {{ inspection.inspectorName || 'Yetkili Kontrolör' }}
              </span>

              <!-- Yağ Seviyesi -->
              <UiBadge :variant="getOilLevelVariant(inspection.oilLevel)">
                Yağ: {{ getOilLevelLabel(inspection.oilLevel) }}
              </UiBadge>

              <!-- Sonuç -->
              <UiBadge :variant="getResultVariant(inspection.result)">
                {{ getResultLabel(inspection.result) }}
              </UiBadge>
            </div>

            <p v-if="inspection.notes" class="text-xs text-slate-600 mt-1 leading-relaxed">
              {{ inspection.notes }}
            </p>
          </div>
        </div>

        <div class="text-xs text-slate-400 font-medium shrink-0 self-end sm:self-center">
          {{ formatDate(inspection.inspectionDate) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CheckCircle2, Activity } from 'lucide-vue-next'
import type { WeeklyInspectionItem, OilLevelEnum, InspectionResultEnum } from '~/shared/types'

defineProps<{
  inspections: WeeklyInspectionItem[]
}>()

const formatDate = (date: string | Date) => {
  try {
    return new Date(date).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
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

