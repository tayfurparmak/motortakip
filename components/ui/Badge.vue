<template>
  <span
    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide transition-colors"
    :class="variantClasses"
  >
    <span
      v-if="dot"
      class="w-1.5 h-1.5 rounded-full"
      :class="dotClasses"
    />
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
    dot?: boolean
  }>(),
  {
    variant: 'neutral',
    dot: true
  }
)

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'success':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
    case 'warning':
      return 'bg-amber-50 text-amber-700 border border-amber-200/60'
    case 'danger':
      return 'bg-rose-50 text-rose-700 border border-rose-200/60'
    case 'info':
      return 'bg-blue-50 text-blue-700 border border-blue-200/60'
    default:
      return 'bg-slate-100 text-slate-700 border border-slate-200/60'
  }
})

const dotClasses = computed(() => {
  switch (props.variant) {
    case 'success':
      return 'bg-emerald-500'
    case 'warning':
      return 'bg-amber-500 animate-pulse'
    case 'danger':
      return 'bg-rose-500 animate-pulse'
    case 'info':
      return 'bg-blue-500'
    default:
      return 'bg-slate-400'
  }
})
</script>

