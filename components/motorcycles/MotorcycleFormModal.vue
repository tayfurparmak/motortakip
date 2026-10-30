<template>
  <UiModal
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :title="isEdit ? 'Motor Bilgilerini Düzenle' : 'Yeni Motor Ekle'"
    :subtitle="isEdit ? `${motorcycle?.plate} plakalı motoru güncelliyorsunuz.` : 'Filoya dahil edilecek motosikletin bilgilerini giriniz.'"
    size="lg"
  >
    <form @submit.prevent="handleSubmit" id="motorcycle-form" class="space-y-5">
      <!-- Error Banner -->
      <div v-if="errorMessage" class="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2">
        <AlertCircle class="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Temel Bilgiler Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <!-- Plaka -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1.5">
            Plaka <span class="text-rose-500">*</span>
          </label>
          <input
            v-model="form.plate"
            type="text"
            required
            placeholder="Örn: 35 ABC 123"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none uppercase font-mono tracking-wider"
          />
        </div>

        <!-- Marka -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1.5">
            Marka <span class="text-rose-500">*</span>
          </label>
          <input
            v-model="form.brand"
            type="text"
            required
            placeholder="Örn: Honda, Yamaha"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        <!-- Model -->
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1.5">
            Model <span class="text-rose-500">*</span>
          </label>
          <input
            v-model="form.model"
            type="text"
            required
            placeholder="Örn: Forza 250, XMAX"
            class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      <!-- Kilometre & Yağ Bakım Alanı -->
      <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
        <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Gauge class="w-4 h-4 text-blue-600" />
          Kilometre ve Yağ Bakım Ayarları
        </h4>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <!-- Güncel KM -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">
              Güncel KM <span class="text-rose-500">*</span>
            </label>
            <input
              v-model.number="form.currentKm"
              type="number"
              min="0"
              required
              placeholder="0"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <!-- Son Yağ Bakım KM -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">
              Son Yağ Bakım KM
            </label>
            <input
              v-model.number="form.lastOilChangeKm"
              type="number"
              min="0"
              :placeholder="form.currentKm ? String(form.currentKm) : '0'"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <!-- Bakım Aralığı (KM) -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">
              Bakım Aralığı (KM) <span class="text-rose-500">*</span>
            </label>
            <input
              v-model.number="form.oilChangeIntervalKm"
              type="number"
              min="500"
              step="500"
              required
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <!-- Son Bakım Tarihi -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">
              Son Yağ Bakım Tarihi
            </label>
            <input
              v-model="form.lastOilChangeDate"
              type="date"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      <!-- Sigorta & Muayene Tarihleri -->
      <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
        <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Calendar class="w-4 h-4 text-emerald-600" />
          Resmi Evrak & Geçerlilik Tarihleri
        </h4>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <!-- Sigorta Başlangıç -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">
              Sigorta Başlangıç Tarihi
            </label>
            <input
              v-model="form.insuranceStartDate"
              type="date"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <!-- Sigorta Bitiş -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">
              Sigorta Bitiş Tarihi
            </label>
            <input
              v-model="form.insuranceEndDate"
              type="date"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <!-- Muayene Bitiş -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1.5">
              Muayene Bitiş Tarihi
            </label>
            <input
              v-model="form.inspectionExpiryDate"
              type="date"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      <!-- Açıklama & Notlar -->
      <div>
        <label class="block text-xs font-semibold text-slate-700 mb-1.5">
          Açıklama / Filo Notu
        </label>
        <textarea
          v-model="form.notes"
          rows="2"
          placeholder="Örn: Filo No 102, kurye teslimat aracı..."
          class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
        ></textarea>
      </div>
    </form>

    <template #footer>
      <button
        type="button"
        @click="$emit('update:modelValue', false)"
        class="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-100 transition-colors"
      >
        Vazgeç
      </button>
      <button
        type="submit"
        form="motorcycle-form"
        :disabled="isSubmitting"
        class="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50"
      >
        <span v-if="isSubmitting" class="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        <span>{{ isEdit ? 'Değişiklikleri Kaydet' : 'Motoru Kaydet' }}</span>
      </button>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { AlertCircle, Gauge, Calendar } from 'lucide-vue-next'
import type { MotorcycleItem } from '~/shared/types'

const props = defineProps<{
  modelValue: boolean
  motorcycle?: MotorcycleItem | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved'): void
}>()

const isEdit = computed(() => !!props.motorcycle?.id)
const isSubmitting = ref(false)
const errorMessage = ref('')

const defaultForm = () => ({
  plate: '',
  brand: '',
  model: '',
  currentKm: 0,
  lastOilChangeKm: 0,
  lastOilChangeDate: '',
  oilChangeIntervalKm: 3000,
  insuranceStartDate: '',
  insuranceEndDate: '',
  inspectionExpiryDate: '',
  notes: ''
})

const form = ref(defaultForm())

// Tarihi YYYY-MM-DD formatına çevir
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
        plate: m.plate,
        brand: m.brand,
        model: m.model,
        currentKm: m.currentKm,
        lastOilChangeKm: m.lastOilChangeKm ?? m.currentKm,
        lastOilChangeDate: formatDateForInput(m.lastOilChangeDate),
        oilChangeIntervalKm: m.oilChangeIntervalKm || 3000,
        insuranceStartDate: formatDateForInput(m.insuranceStartDate),
        insuranceEndDate: formatDateForInput(m.insuranceEndDate),
        inspectionExpiryDate: formatDateForInput(m.inspectionExpiryDate),
        notes: m.notes || ''
      }
    } else {
      form.value = defaultForm()
    }
    errorMessage.value = ''
  },
  { immediate: true }
)

const handleSubmit = async () => {
  isSubmitting.value = true
  errorMessage.value = ''

  try {
    const payload = {
      ...form.value,
      lastOilChangeKm: form.value.lastOilChangeKm || form.value.currentKm,
      lastOilChangeDate: form.value.lastOilChangeDate ? new Date(form.value.lastOilChangeDate).toISOString() : null,
      insuranceStartDate: form.value.insuranceStartDate ? new Date(form.value.insuranceStartDate).toISOString() : null,
      insuranceEndDate: form.value.insuranceEndDate ? new Date(form.value.insuranceEndDate).toISOString() : null,
      inspectionExpiryDate: form.value.inspectionExpiryDate ? new Date(form.value.inspectionExpiryDate).toISOString() : null
    }

    if (isEdit.value && props.motorcycle?.id) {
      await $fetch(`/api/motorcycles/${props.motorcycle.id}`, {
        method: 'PATCH',
        body: payload
      })
    } else {
      await $fetch('/api/motorcycles', {
        method: 'POST',
        body: payload
      })
    }

    emit('saved')
    emit('update:modelValue', false)
  } catch (err: any) {
    errorMessage.value = err?.data?.statusMessage || err?.message || 'Kayıt sırasında bir hata oluştu.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

