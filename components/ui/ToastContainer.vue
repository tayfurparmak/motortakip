<template>
  <div class="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
    <TransitionGroup
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border text-sm backdrop-blur-md"
        :class="{
          'bg-emerald-50/95 border-emerald-200 text-emerald-900': toast.type === 'success',
          'bg-rose-50/95 border-rose-200 text-rose-900': toast.type === 'error',
          'bg-amber-50/95 border-amber-200 text-amber-900': toast.type === 'warning',
          'bg-blue-50/95 border-blue-200 text-blue-900': toast.type === 'info'
        }"
      >
        <!-- Icon -->
        <div class="shrink-0 mt-0.5">
          <CheckCircle2 v-if="toast.type === 'success'" class="w-5 h-5 text-emerald-600" />
          <XCircle v-else-if="toast.type === 'error'" class="w-5 h-5 text-rose-600" />
          <AlertTriangle v-else-if="toast.type === 'warning'" class="w-5 h-5 text-amber-600" />
          <Info v-else class="w-5 h-5 text-blue-600" />
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <p class="font-semibold leading-tight">{{ toast.title }}</p>
          <p v-if="toast.message" class="text-xs mt-1 opacity-90 leading-relaxed">{{ toast.message }}</p>
        </div>

        <!-- Close -->
        <button
          type="button"
          @click="remove(toast.id)"
          class="shrink-0 p-1 rounded-lg opacity-70 hover:opacity-100 transition-opacity"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-vue-next'
import { useToast } from '~/composables/useToast'

const { toasts, remove } = useToast()
</script>

