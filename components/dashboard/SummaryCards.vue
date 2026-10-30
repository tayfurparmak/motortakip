<template>
  <div class="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
    <!-- Toplam Motor -->
    <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/70 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all group">
      <div class="flex items-center justify-between mb-3">
        <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Toplam Motor</span>
        <div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          <Bike class="w-4 h-4" />
        </div>
      </div>
      <p class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
        {{ summary?.totalMotorcycles ?? 0 }}
      </p>
      <p class="text-[11px] text-slate-400 font-medium mt-1">Aktif filodaki motorlar</p>
    </div>

    <!-- Bakımı Yaklaşan -->
    <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/70 shadow-2xs hover:shadow-xs hover:border-amber-300 transition-all group">
      <div class="flex items-center justify-between mb-3">
        <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Bakım Yaklaştı</span>
        <div class="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          <Clock class="w-4 h-4" />
        </div>
      </div>
      <p class="text-2xl sm:text-3xl font-extrabold text-amber-600 tracking-tight">
        {{ summary?.upcomingMaintenance ?? 0 }}
      </p>
      <p class="text-[11px] text-amber-700/80 font-medium mt-1">0–500 KM kaldı</p>
    </div>

    <!-- Geciken Bakım -->
    <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/70 shadow-2xs hover:shadow-xs hover:border-rose-300 transition-all group">
      <div class="flex items-center justify-between mb-3">
        <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Bakım Gecikti</span>
        <div class="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          <AlertTriangle class="w-4 h-4" />
        </div>
      </div>
      <p class="text-2xl sm:text-3xl font-extrabold text-rose-600 tracking-tight">
        {{ summary?.overdueMaintenance ?? 0 }}
      </p>
      <p class="text-[11px] text-rose-700/80 font-medium mt-1">Acil servis gerekiyor</p>
    </div>

    <!-- Sigortası Yaklaşan -->
    <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/70 shadow-2xs hover:shadow-xs hover:border-indigo-300 transition-all group">
      <div class="flex items-center justify-between mb-3">
        <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Sigorta Uyarısı</span>
        <div class="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          <ShieldAlert class="w-4 h-4" />
        </div>
      </div>
      <p class="text-2xl sm:text-3xl font-extrabold text-indigo-600 tracking-tight">
        {{ summary?.upcomingInsurance ?? 0 }}
      </p>
      <p class="text-[11px] text-slate-400 font-medium mt-1">30 gün içinde yenileme</p>
    </div>

    <!-- Muayenesi Yaklaşan -->
    <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/70 shadow-2xs hover:shadow-xs hover:border-purple-300 transition-all group col-span-2 sm:col-span-1">
      <div class="flex items-center justify-between mb-3">
        <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Muayene Uyarısı</span>
        <div class="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          <FileCheck class="w-4 h-4" />
        </div>
      </div>
      <p class="text-2xl sm:text-3xl font-extrabold text-purple-600 tracking-tight">
        {{ summary?.upcomingInspection ?? 0 }}
      </p>
      <p class="text-[11px] text-slate-400 font-medium mt-1">TÜVTÜRK muayenesi</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Bike,
  Clock,
  AlertTriangle,
  ShieldAlert,
  FileCheck
} from 'lucide-vue-next'
import type { DashboardSummary } from '~/shared/types'

defineProps<{
  summary?: DashboardSummary | null
}>()
</script>
