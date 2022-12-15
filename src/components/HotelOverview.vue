<script setup>
const hotels = ["Hotel A", "Hotel B"]; // ToDo: to be replaced by hotels store
</script>

<template>
  <v-container>
    <h2><v-icon icon="mdi-bed" size="large"></v-icon>Selected Hotels</h2>
    <ul>
      <li v-for="hotel in hotels" :key="hotel">{{ hotel }}</li>
    </ul>
  </v-container>
</template>

<script>
</script>
