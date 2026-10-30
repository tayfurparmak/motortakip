<template>
  <UiModal
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    title="Haftalık Yağ Kontrolü Yap"
    :subtitle="`${motorcycle?.plate} — ${motorcycle?.brand} ${motorcycle?.model}`"
    size="md"
  >
    <form @submit.prevent="handleSubmit" id="inspection-form" class="space-y-4">
      <div v-if="errorMessage" class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
        {{ errorMessage }}
      </div>

      <!-- Teknisyen Adı & Kontrol Tarihi -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1.5">
            Kontrolü Yapan Kişi / Teknisyen <span class="text-rose-500">*</span>
          </label>
          <input
            v-model="form.inspectorName"
            type="text"
            required
            placeholder="Örn: Ahmet Usta"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1.5">
            Kontrol Tarihi <span class="text-rose-500">*</span>
          </label>
          <input
            v-model="form.inspectionDate"
            type="date"
            required
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      <!-- Yağ Seviyesi Seçimi -->
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-2">
          Yağ Seviyesi Durumu <span class="text-rose-500">*</span>
        </label>
        <div class="grid grid-cols-3 gap-2.5">
          <label
            class="flex items-center justify-center p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all"
            :class="form.oilLevel === 'NORMAL' ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'"
          >
            <input type="radio" v-model="form.oilLevel" value="NORMAL" class="sr-only" />
            <span>Normal</span>
          </label>

          <label
            class="flex items-center justify-center p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all"
            :class="form.oilLevel === 'LOW' ? 'border-amber-500 bg-amber-50 text-amber-800' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'"
          >
            <input type="radio" v-model="form.oilLevel" value="LOW" class="sr-only" />
            <span>Düşük</span>
          </label>

          <label
            class="flex items-center justify-center p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all"
            :class="form.oilLevel === 'CRITICAL' ? 'border-rose-500 bg-rose-50 text-rose-800' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'"
          >
            <input type="radio" v-model="form.oilLevel" value="CRITICAL" class="sr-only" />
            <span>Kritik</span>
          </label>
        </div>
      </div>

      <!-- Kontrol Sonucu -->
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-2">
          Kontrol Sonucu & Karar <span class="text-rose-500">*</span>
        </label>
        <div class="grid grid-cols-3 gap-2.5">
          <label
            class="flex items-center justify-center p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all text-center"
            :class="form.result === 'OK' ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'"
          >
            <input type="radio" v-model="form.result" value="OK" class="sr-only" />
            <span>Sorun Yok</span>
          </label>

          <label
            class="flex items-center justify-center p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all text-center"
            :class="form.result === 'MAINTENANCE_NEEDED' ? 'border-amber-500 bg-amber-50 text-amber-800' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'"
          >
            <input type="radio" v-model="form.result" value="MAINTENANCE_NEEDED" class="sr-only" />
            <span>Bakım Gerekli</span>
          </label>

          <label
            class="flex items-center justify-center p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all text-center"
            :class="form.result === 'URGENT_ACTION' ? 'border-rose-500 bg-rose-50 text-rose-800' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'"
          >
            <input type="radio" v-model="form.result" value="URGENT_ACTION" class="sr-only" />
            <span>Acil Müdahale</span>
          </label>
        </div>
      </div>

      <!-- Açıklama / Not -->
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1.5">
          Kontrol Notu & Açıklama
        </label>
        <textarea
          v-model="form.notes"
          rows="2"
          placeholder="Örn: Yağ çubuğu seviyesi minimum çizgisinde, ekleme yapıldı..."
          class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
        ></textarea>
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
        form="inspection-form"
        :disabled="isSubmitting"
        class="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
      >
        <span v-if="isSubmitting" class="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        <span>Kontrolü Kaydet</span>
      </button>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { MotorcycleItem, OilLevelEnum, InspectionResultEnum } from '~/shared/types'

const props = defineProps<{
  modelValue: boolean
  motorcycle?: {
    id: string
    plate: string
    brand: string
    model: string
  } | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved'): void
}>()

const isSubmitting = ref(false)
const errorMessage = ref('')

const form = ref({
  inspectorName: '',
  inspectionDate: new Date().toISOString().split('T')[0],
  oilLevel: 'NORMAL' as OilLevelEnum,
  result: 'OK' as InspectionResultEnum,
  notes: ''
})

watch(
  () => props.motorcycle,
  () => {
    form.value = {
      inspectorName: '',
      inspectionDate: new Date().toISOString().split('T')[0],
      oilLevel: 'NORMAL',
      result: 'OK',
      notes: ''
    }
    errorMessage.value = ''
  },
  { immediate: true }
)

const handleSubmit = async () => {
  if (!props.motorcycle?.id) return
  isSubmitting.value = true
  errorMessage.value = ''

  try {
    await $fetch(`/api/motorcycles/${props.motorcycle.id}/inspections`, {
      method: 'POST',
      body: {
        inspectorName: form.value.inspectorName,
        inspectionDate: new Date(form.value.inspectionDate).toISOString(),
        oilLevel: form.value.oilLevel,
        result: form.value.result,
        notes: form.value.notes || null
      }
    })

    emit('saved')
    emit('update:modelValue', false)
  } catch (err: any) {
    errorMessage.value = err?.data?.statusMessage || err?.message || 'Kontrol kaydedilirken bir hata oluştu.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

