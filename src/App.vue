<script setup>
import HotelOverview from "./components/HotelOverview.vue";
import Personalization from "./components/Personalization.vue";

const sections = [
  {
    id: "map",
    title: "Map",
    icon: "mdi-map",
  },
  {
    id: "ratings",
    title: "Ratings",
    icon: "mdi-star",
  },
  {
    id: "good-and-bad",
    title: "Good and Bad",
    icon: "mdi-plus-minus-variant",
  },
  {
    id: "stories",
    title: "Stories",
    icon: "mdi-comment-quote",
  },
  {
    id: "fun",
    title: "Fun Facts",
    icon: "mdi-party-popper",
  },
];
</script>


<template>
  <v-app>
    <v-app-bar title="Hotel Review Comparison"></v-app-bar>
    <v-navigation-drawer expand-on-hover rail>
      <v-list>
        <v-list-item
          title="Hotel Selection"
          prepend-icon="mdi-bookmark-box-multiple"
        ></v-list-item>
        <v-divider></v-divider>
        <v-list-item
          v-for="section in sections"
          :key="section.title"
          :title="section.title"
          :prepend-icon="section.icon"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-navigation-drawer permanent location="right" width="344"
      ><Personalization
    /></v-navigation-drawer>
    <v-main class="ma-6">
      <div class="content mx-auto">
        <div>
          <div class="text-h4">Hotel Selection</div>
          <HotelOverview />
        </div>
        <div v-for="section in sections" :key="section.title" class="my-6">
          <div class="text-h5">
            <a :id="section.id"></a>
            <v-icon :icon="section.icon" class="mr-2"></v-icon
            >{{ section.title }}
          </div>
          <div class="ml-12">
            <p>
              Lorem ipsum dolor sit, amet consectetur adipisicing elit.
              Molestiae at, ratione odit iure deleniti quae corrupti libero ex
              adipisci nobis nihil eveniet hic autem aliquid reprehenderit
              mollitia. Temporibus, repudiandae quae.
            </p>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugiat
              harum accusantium earum saepe neque. Earum quo, tempora cupiditate
              quod repellat praesentium ad dicta odit dolores alias. Eligendi
              quos veritatis animi?
            </p>
          </div>
        </div>
      </div>
    </v-main>
  </v-app>
</template>

<style scoped>
.content {
  max-width: 1000px;
}
</style>
