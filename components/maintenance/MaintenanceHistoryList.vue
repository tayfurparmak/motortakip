<template>
  <div class="space-y-3">
    <div v-if="records.length === 0" class="p-8 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200/60">
      <Wrench class="w-8 h-8 text-slate-300 mx-auto mb-2" />
      <p class="text-sm font-semibold text-slate-700">Henüz bakım kaydı girilmedi</p>
      <p class="text-xs text-slate-400 mt-1">İlk periyodik bakım veya yağ değişimi yapıldığında kayıt ekleyebilirsiniz.</p>
    </div>

    <div v-else class="divide-y divide-slate-100 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
      <div
        v-for="record in records"
        :key="record.id"
        class="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
      >
        <div class="flex items-start gap-3.5">
          <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
            <Wrench class="w-5 h-5" />
          </div>

          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-bold text-sm text-slate-900">{{ getMaintenanceTypeLabel(record.maintenanceType) }}</span>
              <span class="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                {{ record.maintenanceKm.toLocaleString('tr-TR') }} KM
              </span>
              <span v-if="record.cost" class="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                ₺{{ record.cost.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) }}
              </span>
            </div>

            <p v-if="record.description" class="text-xs text-slate-600 mt-1 leading-relaxed">
              {{ record.description }}
            </p>
          </div>
        </div>

        <div class="text-xs text-slate-400 font-medium shrink-0 self-end sm:self-center">
          {{ formatDate(record.maintenanceDate) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Wrench } from 'lucide-vue-next'
import type { MaintenanceRecordItem } from '~/shared/types'

defineProps<{
  records: MaintenanceRecordItem[]
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

const getMaintenanceTypeLabel = (type: string) => {
  switch (type) {
    case 'OIL_CHANGE':
      return 'Yağ Değişimi'
    case 'FILTER_CHANGE':
      return 'Filtre Değişimi'
    case 'BRAKE_SERVICE':
      return 'Fren Bakımı'
    case 'TYRE_CHANGE':
      return 'Lastik Değişimi'
    case 'CHAIN_SERVICE':
      return 'Zincir Bakımı'
    case 'GENERAL_SERVICE':
      return 'Genel Ağır Bakım'
    case 'OTHER':
      return 'Diğer Servis İşlemi'
    default:
      return type
  }
}
</script>

