<script>
import CategoryName from "./CategoryName.vue";

export default {
  components: {CategoryName},
  props: {
    category: {
      type: String,
      default: "category",
    },
    hotelName: {
      type: String,
      default: "hotelName",
    },
    review: {
      type: Object,
    },
  },
};
</script>

<template>
  <v-card>
    <v-card-title>
      <CategoryName
          :categoryId="category"
      ></CategoryName>
    </v-card-title>
    <v-card-text>
      <p>{{hotelName}}</p>
      <p>{{review.title}}</p>
      <p>{{review.text}}</p>
      <p>{{review.match_score}}</p>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn
          color="green darken-1"
          text
          @click="dialog = false"
      >
        Close
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<style>
.v-avatar {
  width: 100px !important;
}
</style>