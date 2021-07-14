<template>
  <div>hi</div>
</template>

<script lang="ts">
import { defineProps } from 'vue'
import { Test3 } from './index'
import { Test2 } from './normal.vue'

export { Test2 }

export { Test3 }

defineProps<{
  /** The initial number */
  start: number
}>()
</script>
