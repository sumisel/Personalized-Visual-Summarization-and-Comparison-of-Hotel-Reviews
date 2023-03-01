<script setup>
import Personalization from "./components/Personalization.vue";
import Map from "./components/Map.vue";
import HotelOverview from "./components/HotelOverview.vue";
import CloseBy from "./components/CloseBy.vue"
import { onMounted } from "vue";
import { useHotelStore } from "./stores/hotel.js";

const sections = [
  {
    id: "map",
    title: "Hotel Selection",
    icon: "mdi-map",
    component: Map,
  },
  {
    id: "ratings",
    title: "Hotel Ratings",
    icon: "mdi-office-building",
    component: HotelOverview,
  },
  {
    id: "good-and-bad",
    title: "Good and Bad",
    icon: "mdi-plus-minus-variant",
  },
  {
    id: "close-by",
    title: "Am I Close?",
    icon: "mdi-map-marker-radius",
    component: CloseBy,
  },
  {
    id: "trend",
    title: "Trending",
    icon: "mdi-trending-up",
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

const scrollTo = (hash) => {
  location.hash = `#${hash}`;
};

onMounted(async() => {
  await useHotelStore().getHotels();
});
</script>

<template>
  <v-app>
    <v-app-bar
      ><v-app-bar-title
        ><v-icon icon="mdi-office-building"></v-icon
        ><v-icon icon="mdi-arrow-left-right"></v-icon
        ><v-icon icon="mdi-office-building" class="mr-4"></v-icon>Hotel Review
        Comparison</v-app-bar-title
      ></v-app-bar
    >
    <v-navigation-drawer expand-on-hover rail elevation="2">
      <v-list>
        <v-list-item
          v-for="section in sections"
          :key="section.title"
          :title="section.title"
          :prepend-icon="section.icon"
          @click="scrollTo(section.id)"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-navigation-drawer permanent location="right" width="344" elevation="2"
      ><Personalization
    /></v-navigation-drawer>
    <v-main class="ma-6">
      <div class="content mx-auto">
        <div class="text-h1 my-16" id="city-name">Daisy Town</div>
        <div
          v-for="section in sections"
          :key="section.title"
          class="py-6"
          :id="section.id"
        >
          <div class="text-h4 mb-4 pt-16">
            <v-icon :icon="section.icon" class="mr-2"></v-icon
            >{{ section.title }}
          </div>
          <component
            v-if="section.component"
            :is="section.component"
            class="ml-16"
          ></component>
          <div class="ml-16" v-else>
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

<style lang="scss">
.v-main {
  width: 100%;
  height: 800px;
  position: absolute;
  background-image: linear-gradient(
      rgba(255, 255, 255, 0),
      rgba(255, 255, 255, 1)
    ),
    url("https://upload.wikimedia.org/wikipedia/commons/7/71/AntelopeHills.jpg");
  background-size: 100%;
  background-position-x: center;
  background-position-y: bottom;
}

.content {
  max-width: 1000px;
  margin-top: 500px;
}

.hover {
  background: var(--lt-color-background-dark);
}

div,
p {
  cursor: default;
}
</style>
