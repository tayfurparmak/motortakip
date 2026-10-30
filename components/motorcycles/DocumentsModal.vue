<template>
  <UiModal
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    title="Sigorta ve Muayene Tarihlerini Güncelle"
    :subtitle="`${motorcycle?.plate} — ${motorcycle?.brand} ${motorcycle?.model}`"
    size="md"
  >
    <form @submit.prevent="handleSubmit" id="docs-form" class="space-y-5">
      <div v-if="errorMessage" class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
        {{ errorMessage }}
      </div>

      <!-- Trafik Sigortası Kartı -->
      <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
        <div class="flex items-center justify-between">
          <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert class="w-4 h-4 text-blue-600" />
            Zorunlu Trafik Sigortası
          </h4>
          <span
            v-if="insurancePreview"
            class="text-[11px] font-bold px-2 py-0.5 rounded-full"
            :class="{
              'bg-emerald-100 text-emerald-800': insurancePreview.status === 'active',
              'bg-amber-100 text-amber-800': insurancePreview.status === 'upcoming',
              'bg-rose-100 text-rose-800': insurancePreview.status === 'expired'
            }"
          >
            {{ formatDaysLeft(insurancePreview.daysLeft) }}
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">
              Poliçe Başlangıç Tarihi
            </label>
            <input
              v-model="form.insuranceStartDate"
              type="date"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">
              Poliçe Bitiş Tarihi
            </label>
            <input
              v-model="form.insuranceEndDate"
              type="date"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      <!-- TÜVTÜRK Muayene Kartı -->
      <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
        <div class="flex items-center justify-between">
          <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <FileCheck class="w-4 h-4 text-purple-600" />
            TÜVTÜRK Periyodik Muayene
          </h4>
          <span
            v-if="inspectionPreview"
            class="text-[11px] font-bold px-2 py-0.5 rounded-full"
            :class="{
              'bg-emerald-100 text-emerald-800': inspectionPreview.status === 'valid',
              'bg-amber-100 text-amber-800': inspectionPreview.status === 'upcoming',
              'bg-rose-100 text-rose-800': inspectionPreview.status === 'expired'
            }"
          >
            {{ formatDaysLeft(inspectionPreview.daysLeft) }}
          </span>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1.5">
            Muayene Geçerlilik Bitiş Tarihi
          </label>
          <input
            v-model="form.inspectionExpiryDate"
            type="date"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      </div>
    </form>

    <template #footer>
      <button
        type="button"
        @click="$emit('update:modelValue', false)"
        class="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-100 transition-colors"
      >
        Vazgeç
      </button>
      <button
        type="submit"
        form="docs-form"
        :disabled="isSubmitting"
        class="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
      >
        <span v-if="isSubmitting" class="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        <span>Tarihleri Güncelle</span>
      </button>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ShieldAlert, FileCheck } from 'lucide-vue-next'
import { calculateInsuranceStatus, calculateInspectionStatus } from '~/shared/utils/calculations'
import type { MotorcycleItem } from '~/shared/types'

const props = defineProps<{
  modelValue: boolean
  motorcycle?: MotorcycleItem | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved'): void
}>()

const isSubmitting = ref(false)
const errorMessage = ref('')

const form = ref({
  insuranceStartDate: '',
  insuranceEndDate: '',
  inspectionExpiryDate: ''
})

const formatDateForInput = (d: string | Date | null | undefined) => {
  if (!d) return ''
  try {
    const date = new Date(d)
    return date.toISOString().split('T')[0]
  } catch {
    return ''
  }
}

watch(
  () => props.motorcycle,
  (m) => {
    if (m) {
      form.value = {
        insuranceStartDate: formatDateForInput(m.insuranceStartDate),
        insuranceEndDate: formatDateForInput(m.insuranceEndDate),
        inspectionExpiryDate: formatDateForInput(m.inspectionExpiryDate)
      }
    }
    errorMessage.value = ''
  },
  { immediate: true }
)

const insurancePreview = computed(() => {
  if (!form.value.insuranceEndDate) return null
  return calculateInsuranceStatus(form.value.insuranceEndDate)
})

const inspectionPreview = computed(() => {
  if (!form.value.inspectionExpiryDate) return null
  return calculateInspectionStatus(form.value.inspectionExpiryDate)
})

const formatDaysLeft = (days: number | null | undefined) => {
  if (days === null || days === undefined) return 'Belirtilmedi'
  if (days < 0) return `${Math.abs(days)} gün geçti`
  if (days === 0) return 'Bugün doluyor'
  return `${days} gün kaldı`
}

const handleSubmit = async () => {
  if (!props.motorcycle?.id) return
  isSubmitting.value = true
  errorMessage.value = ''

  try {
    await $fetch(`/api/motorcycles/${props.motorcycle.id}`, {
      method: 'PATCH',
      body: {
        insuranceStartDate: form.value.insuranceStartDate ? new Date(form.value.insuranceStartDate).toISOString() : null,
        insuranceEndDate: form.value.insuranceEndDate ? new Date(form.value.insuranceEndDate).toISOString() : null,
        inspectionExpiryDate: form.value.inspectionExpiryDate ? new Date(form.value.inspectionExpiryDate).toISOString() : null
      }
    })

    emit('saved')
    emit('update:modelValue', false)
  } catch (err: any) {
    errorMessage.value = err?.data?.statusMessage || err?.message || 'Tarihler güncellenirken bir hata oluştu.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

