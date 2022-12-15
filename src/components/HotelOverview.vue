<script setup>
const hotels = ["Hotel A", "Hotel B"]; // ToDo: to be replaced by hotels store
</script>

<template>
  <h2><v-icon icon="mdi-bed" size="large"></v-icon>Selected Hotels</h2>
  <div class="d-flex flex-row flex-wrap">
    <v-card
      v-for="hotel in hotels"
      :key="hotel"
      :title="hotel"
      subtitle="..."
      text="..."
      class="ma-2 flex-grow-1"
    ></v-card>
  </div>
</template>

<script>
</script>
