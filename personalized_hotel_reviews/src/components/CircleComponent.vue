<template>
  <circle cx="200" :cy="200 + 20*i" r="10" fill="white" />
</template>

<script setup>
const props = defineProps({
  i: {
    type: Number,
    required: true
  }
})
</script>