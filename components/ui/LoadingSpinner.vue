<template>
  <div class="flex flex-col items-center justify-center p-8 text-center text-slate-500">
    <div class="relative w-10 h-10 mb-3">
      <div class="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
    <p class="text-sm font-medium">{{ text }}</p>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    text?: string
  }>(),
  {
    text: 'Yükleniyor...'
  }
)
</script>

