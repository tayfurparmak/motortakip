<template>
  <UiModal
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    title="Kilometre Güncelle"
    :subtitle="`${motorcycle?.plate} — ${motorcycle?.brand} ${motorcycle?.model}`"
    size="sm"
  >
    <form @submit.prevent="handleSubmit" id="km-form" class="space-y-4">
      <div v-if="errorMessage" class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
        {{ errorMessage }}
      </div>

      <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex justify-between items-center">
        <span class="text-slate-500 font-medium">Kayıtlı Kilometre:</span>
        <span class="font-bold text-slate-900 font-mono text-sm">
          {{ (motorcycle?.currentKm ?? 0).toLocaleString('tr-TR') }} KM
        </span>
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1.5">
          Yeni Güncel Kilometre <span class="text-rose-500">*</span>
        </label>
        <div class="relative">
          <input
            v-model.number="newKm"
            type="number"
            :min="0"
            required
            autofocus
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-base font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          <span class="absolute right-3.5 top-3 text-xs font-bold text-slate-400">KM</span>
        </div>
        <p v-if="diffKm !== null && diffKm !== 0" class="text-xs mt-1.5 font-medium" :class="diffKm > 0 ? 'text-blue-600' : 'text-amber-600'">
          {{ diffKm > 0 ? `+${diffKm.toLocaleString('tr-TR')} KM artış` : `${diffKm.toLocaleString('tr-TR')} KM azalış` }}
        </p>
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
        form="km-form"
        :disabled="isSubmitting"
        class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
      >
        <span v-if="isSubmitting" class="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        <span>Güncelle</span>
      </button>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { MotorcycleItem } from '~/shared/types'

const props = defineProps<{
  modelValue: boolean
  motorcycle?: MotorcycleItem | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved'): void
}>()

const newKm = ref(0)
const isSubmitting = ref(false)
const errorMessage = ref('')

const diffKm = computed(() => {
  if (!props.motorcycle) return null
  return newKm.value - props.motorcycle.currentKm
})

watch(
  () => props.motorcycle,
  (m) => {
    if (m) {
      newKm.value = m.currentKm
    }
    errorMessage.value = ''
  },
  { immediate: true }
)

const handleSubmit = async () => {
  if (!props.motorcycle) return
  isSubmitting.value = true
  errorMessage.value = ''

  try {
    await $fetch(`/api/motorcycles/${props.motorcycle.id}/km`, {
      method: 'POST',
      body: { currentKm: newKm.value }
    })

    emit('saved')
    emit('update:modelValue', false)
  } catch (err: any) {
    errorMessage.value = err?.data?.statusMessage || err?.message || 'Kilometre güncellenirken bir hata oluştu.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

