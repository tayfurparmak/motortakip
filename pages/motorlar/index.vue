<template>
  <div class="space-y-6">
    <!-- Başlık ve Eylemler -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 class="text-2xl font-extrabold text-slate-900 tracking-tight">Motor Yönetimi</h2>
        <p class="text-sm text-slate-500 mt-1">
          Filodaki tüm motosikletleri kaydedin, güncel kilometrelerini ve periyodik durumlarını yönetin.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          @click="openAddModal"
          class="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-2"
        >
          <Plus class="w-4 h-4" />
          <span>Yeni Motor Ekle</span>
        </button>
      </div>
    </div>

    <!-- Motor Tablosu -->
    <MotorcyclesMotorcycleTable
      :motorcycles="motorcycles"
      :loading="pending"
      @add="openAddModal"
      @edit="openEditModal"
      @quick-km="openKmModal"
      @maintenance="openMaintenanceModal"
      @inspection="openInspectionModal"
      @archive="handleArchive"
    />

    <!-- Ekle / Düzenle Modal -->
    <MotorcyclesMotorcycleFormModal
      v-model="isFormModalOpen"
      :motorcycle="selectedMotorcycle"
      @saved="onSaved"
    />

    <!-- Hızlı KM Güncelle Modal -->
    <MotorcyclesQuickKmModal
      v-model="isKmModalOpen"
      :motorcycle="selectedMotorcycle"
      @saved="onKmSaved"
    />

    <!-- Bakım Yapıldı Modal -->
    <MaintenanceMaintenanceModal
      v-model="isMaintenanceModalOpen"
      :motorcycle="selectedMotorcycle"
      @saved="onMaintenanceSaved"
    />

    <!-- Haftalık Kontrol Modal -->
    <MaintenanceWeeklyInspectionModal
      v-model="isInspectionModalOpen"
      :motorcycle="selectedMotorcycle"
      @saved="onInspectionSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus } from 'lucide-vue-next'
import { useToast } from '~/composables/useToast'
import type { MotorcycleItem } from '~/shared/types'

const toast = useToast()

const isFormModalOpen = ref(false)
const isKmModalOpen = ref(false)
const isMaintenanceModalOpen = ref(false)
const isInspectionModalOpen = ref(false)

const selectedMotorcycle = ref<MotorcycleItem | null>(null)

const { data: motorcyclesData, pending, refresh } = await useFetch<{
  items: MotorcycleItem[]
}>('/api/motorcycles')

const motorcycles = computed(() => motorcyclesData.value?.items ?? [])

const openAddModal = () => {
  selectedMotorcycle.value = null
  isFormModalOpen.value = true
}

const openEditModal = (motorcycle: MotorcycleItem) => {
  selectedMotorcycle.value = motorcycle
  isFormModalOpen.value = true
}

const openKmModal = (motorcycle: MotorcycleItem) => {
  selectedMotorcycle.value = motorcycle
  isKmModalOpen.value = true
}

const openMaintenanceModal = (motorcycle: MotorcycleItem) => {
  selectedMotorcycle.value = motorcycle
  isMaintenanceModalOpen.value = true
}

const openInspectionModal = (motorcycle: MotorcycleItem) => {
  selectedMotorcycle.value = motorcycle
  isInspectionModalOpen.value = true
}

const onSaved = async () => {
  await refresh()
  toast.success(
    selectedMotorcycle.value ? 'Motor bilgileri güncellendi.' : 'Yeni motor filoya başarıyla eklendi.'
  )
}

const onKmSaved = async () => {
  await refresh()
  toast.success('Kilometre başarıyla güncellendi.')
}

const onMaintenanceSaved = async () => {
  await refresh()
  toast.success('Bakım kaydı başarıyla eklendi ve sonraki bakım aralığı hesaplandı.')
}

const onInspectionSaved = async () => {
  await refresh()
  toast.success('Haftalık kontrol başarıyla kaydedildi.')
}

const handleArchive = async (motorcycle: MotorcycleItem) => {
  const confirmed = confirm(
    `${motorcycle.plate} plakalı motoru arşivlemek istediğinize emin misiniz?`
  )
  if (!confirmed) return

  try {
    await $fetch(`/api/motorcycles/${motorcycle.id}`, { method: 'DELETE' })
    toast.success('Motor arşivlendi.')
    await refresh()
  } catch (err: any) {
    toast.error('Motor arşivlenirken bir hata oluştu.', err?.message)
  }
}
</script>
