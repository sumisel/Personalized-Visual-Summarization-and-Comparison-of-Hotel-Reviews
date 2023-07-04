<script setup>

const props = defineProps({
  headerInstruction: {
    type: Boolean,
    default: false,
  },
});
</script>
<template>
  <div class="instruction-container">
    <v-alert :class="{ 'header-instruction': headerInstruction }" class="mb-2 mt-2 instruction text-center elevation-2">
      <slot></slot>
    </v-alert>
  </div>
</template>

<style lang="scss">
.instruction-container {
  position: relative;

  & .instruction {
    font-style: italic;
    color: #444;
    font-size: 0.9rem;
    padding: 0.5rem !important;
    font-weight: bold;

    &.header-instruction {
      bottom: 10px;
      width: 60%;
      left: 40%;
      min-height: 50px;
      position: absolute;
    }
  }
}
</style>
