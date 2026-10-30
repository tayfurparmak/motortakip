<template>
  <UiModal
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    title="Bakım Kaydı Oluştur"
    :subtitle="`${motorcycle?.plate} — ${motorcycle?.brand} ${motorcycle?.model}`"
    size="md"
  >
    <form @submit.prevent="handleSubmit" id="maint-form" class="space-y-4">
      <!-- Error Message -->
      <div v-if="errorMessage" class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
        {{ errorMessage }}
      </div>

      <!-- Bilgi Notu -->
      <div class="p-3 rounded-xl bg-blue-50/80 border border-blue-200/60 text-xs text-blue-900 flex justify-between items-center">
        <div>
          <span class="text-blue-600 font-medium">Güncel Sayaç: </span>
          <span class="font-bold font-mono">{{ (motorcycle?.currentKm ?? 0).toLocaleString('tr-TR') }} KM</span>
        </div>
        <div>
          <span class="text-blue-600 font-medium">Son Bakım: </span>
          <span class="font-bold font-mono">{{ (motorcycle?.lastOilChangeKm ?? 0).toLocaleString('tr-TR') }} KM</span>
        </div>
      </div>

      <!-- Bakım Türü -->
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1.5">
          Bakım Türü <span class="text-rose-500">*</span>
        </label>
        <select
          v-model="form.maintenanceType"
          required
          class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-medium"
        >
          <option value="OIL_CHANGE">Yağ Değişimi</option>
          <option value="FILTER_CHANGE">Filtre Değişimi</option>
          <option value="BRAKE_SERVICE">Fren Bakımı</option>
          <option value="TYRE_CHANGE">Lastik Değişimi</option>
          <option value="CHAIN_SERVICE">Zincir Bakımı</option>
          <option value="GENERAL_SERVICE">Genel Bakım (Ağır Bakım)</option>
          <option value="OTHER">Diğer İşlem</option>
        </select>
        <p v-if="form.maintenanceType === 'OIL_CHANGE' || form.maintenanceType === 'GENERAL_SERVICE'" class="text-[11px] text-blue-600 mt-1 font-medium">
          ℹ️ Bu işlem son yağ bakım kilometresini ve tarihini güncelleyerek sonraki periyodu otomatik başlatacaktır.
        </p>
      </div>

      <!-- Bakım Kilometresi ve Tarihi -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Bakım KM -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1.5">
            Bakım Kilometresi <span class="text-rose-500">*</span>
          </label>
          <input
            v-model.number="form.maintenanceKm"
            type="number"
            min="0"
            required
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        <!-- Bakım Tarihi -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1.5">
            Bakım Tarihi <span class="text-rose-500">*</span>
          </label>
          <input
            v-model="form.maintenanceDate"
            type="date"
            required
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      <!-- Maliyet -->
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1.5">
          Bakım Maliyeti (TL)
        </label>
        <div class="relative">
          <input
            v-model.number="form.cost"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          <span class="absolute right-3.5 top-3 text-xs font-bold text-slate-400">₺</span>
        </div>
      </div>

      <!-- Açıklama / Yapılan İşlem -->
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1.5">
          Yapılan İşlem & Açıklama
        </label>
        <textarea
          v-model="form.description"
          rows="2"
          placeholder="Örn: 10W-40 Motul yağ ve orijinal yağ filtresi yenilendi..."
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
        form="maint-form"
        :disabled="isSubmitting"
        class="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
      >
        <span v-if="isSubmitting" class="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        <span>Bakımı Kaydet</span>
      </button>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { MotorcycleItem, MaintenanceTypeEnum } from '~/shared/types'

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
  maintenanceType: 'OIL_CHANGE' as MaintenanceTypeEnum,
  maintenanceKm: 0,
  maintenanceDate: new Date().toISOString().split('T')[0],
  cost: null as number | null,
  description: ''
})

watch(
  () => props.motorcycle,
  (m) => {
    if (m) {
      form.value = {
        maintenanceType: 'OIL_CHANGE',
        maintenanceKm: m.currentKm,
        maintenanceDate: new Date().toISOString().split('T')[0],
        cost: null,
        description: ''
      }
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
    await $fetch(`/api/motorcycles/${props.motorcycle.id}/maintenance`, {
      method: 'POST',
      body: {
        maintenanceType: form.value.maintenanceType,
        maintenanceKm: form.value.maintenanceKm,
        maintenanceDate: new Date(form.value.maintenanceDate).toISOString(),
        cost: form.value.cost ? Number(form.value.cost) : null,
        description: form.value.description || null
      }
    })

    emit('saved')
    emit('update:modelValue', false)
  } catch (err: any) {
    errorMessage.value = err?.data?.statusMessage || err?.message || 'Bakım kaydedilirken bir hata oluştu.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

