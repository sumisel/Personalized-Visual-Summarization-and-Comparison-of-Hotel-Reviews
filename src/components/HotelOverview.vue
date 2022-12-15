<script setup>
const hotels = ["Hotel A", "Hotel B"]; // ToDo: to be replaced by hotels store
</script>

<template>
  <div>
    <p>Selected Hotels</p>
    <ul>
      <li v-for="hotel in hotels" :key="hotel">{{ hotel }}</li>
    </ul>
  </div>
</template>

<script>
</script>
