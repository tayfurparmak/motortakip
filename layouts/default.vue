<template>
  <div class="min-h-screen bg-slate-50/80 text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
    <!-- Üst Navbar (Top Navigation Bar) -->
    <header class="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Sol Kısım: Logo ve Menü Linkleri -->
          <div class="flex items-center gap-8">
            <!-- Marka / Logo -->
            <NuxtLink to="/" class="flex items-center gap-3 group shrink-0">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-sm shadow-blue-500/25 group-hover:scale-105 transition-transform">
                <Bike class="w-5 h-5 text-white" />
              </div>
              <div>
                <span class="text-base font-extrabold text-slate-900 tracking-tight leading-tight block">
                  Rüzgar Kurye
                </span>
                <span class="text-[10px] font-semibold tracking-wider text-slate-400 uppercase block -mt-0.5">
                  Filo & Bakım Paneli
                </span>
              </div>
            </NuxtLink>

            <!-- Masaüstü Navigasyon Sekmeleri -->
            <nav class="hidden md:flex items-center gap-1">
              <NuxtLink
                v-for="item in navItems"
                :key="item.path"
                :to="item.path"
                class="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
                :class="[
                  isRouteActive(item.path)
                    ? 'bg-blue-50 text-blue-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                ]"
              >
                <component
                  :is="item.icon"
                  class="w-4 h-4 transition-colors"
                  :class="isRouteActive(item.path) ? 'text-blue-600' : 'text-slate-400'"
                />
                <span>{{ item.label }}</span>
              </NuxtLink>
            </nav>
          </div>

          <!-- Sağ Kısım: Sistem Durumu & Hızlı Eylemler -->
          <div class="flex items-center gap-3">
            <!-- Canlı Durum Rozeti -->
            <div class="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-semibold text-emerald-800">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Canlı Takip</span>
            </div>

            <!-- Mobil Menü Aç/Kapa Butonu -->
            <button
              type="button"
              @click="isMobileMenuOpen = !isMobileMenuOpen"
              class="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Menüyü Aç"
            >
              <Menu v-if="!isMobileMenuOpen" class="w-6 h-6" />
              <X v-else class="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      <!-- Mobil Açılır Menü (Slide Down) -->
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div
          v-if="isMobileMenuOpen"
          class="md:hidden border-t border-slate-200/80 bg-white px-4 pt-3 pb-5 space-y-1 shadow-lg"
        >
          <NuxtLink
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            @click="isMobileMenuOpen = false"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            :class="[
              isRouteActive(item.path)
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            ]"
          >
            <component :is="item.icon" class="w-4 h-4" />
            <span>{{ item.label }}</span>
          </NuxtLink>

          <div class="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between px-3 text-xs text-slate-400">
            <span>Rüzgar Kurye Filo Takip</span>
            <span class="inline-flex items-center gap-1.5 text-emerald-600 font-medium">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Çevrimiçi
            </span>
          </div>
        </div>
      </Transition>
    </header>

    <!-- Sayfa İçeriği (Ana Gövde) -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <slot />
    </main>

    <!-- Sade Footer -->
    <footer class="border-t border-slate-200/80 bg-white/50 py-4 text-center text-xs text-slate-400">
      <div class="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>© 2026 Rüzgar Kurye — Motor Bakım ve Filo Takip Sistemi</span>
        <span class="text-[11px] text-slate-400">Nuxt 3 & Supabase PostgreSQL</span>
      </div>
    </footer>

    <!-- Global Toast Bildirimleri -->
    <UiToastContainer />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  Bike,
  LayoutDashboard,
  Wrench,
  ShieldCheck,
  Menu,
  X
} from 'lucide-vue-next'

const route = useRoute()
const isMobileMenuOpen = ref(false)

const navItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Motorlar', path: '/motorlar', icon: Bike },
  { label: 'Bakım Takibi', path: '/bakim', icon: Wrench },
  { label: 'Sigorta & Muayene', path: '/sigorta-muayene', icon: ShieldCheck }
]

const isRouteActive = (path: string) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>
