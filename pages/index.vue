<template>
  <div class="space-y-6">
    <!-- Başlık ve Hızlı Aksiyon -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 class="text-2xl font-extrabold text-slate-900 tracking-tight">Filo Özeti ve Bakım Paneli</h2>
        <p class="text-sm text-slate-500 mt-1">
          Motosikletlerinizin bakım durumlarını, kilometrelerini ve resmi evrak sürelerini anlık takip edin.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          @click="refreshData"
          :disabled="isRefreshing"
          class="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs flex items-center gap-2 transition-all disabled:opacity-50"
        >
          <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': isRefreshing }" />
          <span>Yenile</span>
        </button>

        <button
          type="button"
          @click="openAddModal"
          class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-2"
        >
          <Plus class="w-4 h-4" />
          <span>Yeni Motor Ekle</span>
        </button>
      </div>
    </div>

    <!-- Özet İstatistik Kartları -->
    <DashboardSummaryCards :summary="summary" />

    <!-- Yaklaşan & Süresi Dolan Resmi Belgeler Uyarı Paneli (Section 7 & 8) -->
    <DashboardExpiringAlerts
      :motorcycles="motorcycles"
      @update-doc="openDocsModal"
    />

    <!-- Ana Motor Tablosu -->
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

    <!-- Hızlı KM Modal -->
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

    <!-- Resmi Belge Tarihleri Güncelleme Modal (Section 7 & 8) -->
    <MotorcyclesDocumentsModal
      v-model="isDocsModalOpen"
      :motorcycle="selectedMotorcycle"
      @saved="onDocsSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Plus, RefreshCw } from 'lucide-vue-next'
import { useToast } from '~/composables/useToast'
import type { MotorcycleItem, DashboardSummary } from '~/shared/types'

const toast = useToast()

const isFormModalOpen = ref(false)
const isKmModalOpen = ref(false)
const isMaintenanceModalOpen = ref(false)
const isInspectionModalOpen = ref(false)
const isDocsModalOpen = ref(false)

const selectedMotorcycle = ref<MotorcycleItem | null>(null)
const isRefreshing = ref(false)

// Dashboard verilerini çek
const { data: summaryData, refresh: refreshSummary } = await useFetch<DashboardSummary>('/api/dashboard')
const { data: motorcyclesData, pending, refresh: refreshMotorcycles } = await useFetch<{
  items: MotorcycleItem[]
}>('/api/motorcycles')

const summary = computed(() => summaryData.value ?? null)
const motorcycles = computed(() => motorcyclesData.value?.items ?? [])

const refreshData = async () => {
  isRefreshing.value = true
  try {
    await Promise.all([refreshSummary(), refreshMotorcycles()])
    toast.info('Veriler güncellendi.')
  } finally {
    isRefreshing.value = false
  }
}

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

const openDocsModal = (motorcycle: MotorcycleItem) => {
  selectedMotorcycle.value = motorcycle
  isDocsModalOpen.value = true
}

const onSaved = async () => {
  await Promise.all([refreshSummary(), refreshMotorcycles()])
  toast.success(
    selectedMotorcycle.value ? 'Motor bilgileri güncellendi.' : 'Yeni motor başarıyla eklendi.'
  )
}

const onKmSaved = async () => {
  await Promise.all([refreshSummary(), refreshMotorcycles()])
  toast.success('Kilometre başarıyla güncellendi.')
}

const onMaintenanceSaved = async () => {
  await Promise.all([refreshSummary(), refreshMotorcycles()])
  toast.success('Bakım kaydı başarıyla eklendi ve sonraki bakım aralığı hesaplandı.')
}

const onInspectionSaved = async () => {
  await Promise.all([refreshSummary(), refreshMotorcycles()])
  toast.success('Haftalık kontrol başarıyla kaydedildi.')
}

const onDocsSaved = async () => {
  await Promise.all([refreshSummary(), refreshMotorcycles()])
  toast.success('Resmi evrak tarihleri başarıyla güncellendi.')
}

const handleArchive = async (motorcycle: MotorcycleItem) => {
  const confirmed = confirm(
    `${motorcycle.plate} plakalı motoru arşivlemek istediğinize emin misiniz?\n(Geçmiş kayıtlar silinmez, listeden gizlenir.)`
  )
  if (!confirmed) return

  try {
    await $fetch(`/api/motorcycles/${motorcycle.id}`, { method: 'DELETE' })
    toast.success('Motor arşivlendi.')
    await Promise.all([refreshSummary(), refreshMotorcycles()])
  } catch (err: any) {
    toast.error('Motor arşivlenirken bir hata oluştu.', err?.message)
  }
}
</script>
