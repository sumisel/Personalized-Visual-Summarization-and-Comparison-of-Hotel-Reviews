<script setup>
import {ref} from "vue";
import CircleComponent from "./CircleComponent.vue";

defineProps({
  msg: {
    type: String,
    required: true
  }
})
let counter = ref(1)
let liste = [1,2,3]
</script>

<template>
  <div class="greetings">
    <h1 class="green">{{ msg }}</h1>
    <h1>{{ counter }}</h1>
    <svg widht="400" height="400">
      <CircleComponent v-for="(number, index) in liste" :key="'circle' + index" :i="index" />
    </svg>
  </div>
</template>

<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

.greetings h1,
.greetings h3 {
  text-align: center;
}

@media (min-width: 1024px) {
  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
}
</style>
