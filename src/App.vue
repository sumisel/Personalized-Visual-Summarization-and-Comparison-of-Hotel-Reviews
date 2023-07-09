<script setup>
import { inject } from "vue";

import Personalization from "./components/Personalization.vue";
import Map from "./components/Map.vue";
import RatingsSection from "./components/RatingsSection.vue";
import PosNeg from "./components/PosNeg.vue";
import Trending from "./components/Trending.vue";

import { useHotelStore } from "./stores/hotel.js";
const hotelStore = useHotelStore();

const sections = [
  {
    id: "map",
    title: "Hotel Selection",
    subtitle: "Select hotels on the map below.",
    icon: "mdi-map",
    component: Map,
  },
  {
    id: "ratings",
    title: "Customer Ratings",
    subtitle: "How do the hotels compare across rating categories?",
    icon: "mdi-star",
    component: RatingsSection,
  },
  {
    id: "good-and-bad",
    title: "Good and Bad",
    subtitle: "What do customers like and dislike about the hotels?",
    icon: "mdi-plus-minus-variant",
    component: PosNeg,
  },
  {
    id: "trend",
    title: "Trending",
    subtitle: "How do the hotels ratings change over time?",
    icon: "mdi-trending-up",
    component: Trending,
  },
];

const city = inject("city");

const scrollTo = (hash) => {
  location.hash = `#${hash}`;
};
</script>

<template>
  <v-app>
    <v-app-bar>
      <img src="/logo.png" alt="logo" class="mr-2 ml-4" height="48" />
      <v-app-bar-title class="text-h4">
        <span>
          ViSCitR
          <v-tooltip activator="parent" location="right">
            <strong>Vi</strong>sual <strong>S</strong>ummarization and
            <strong>C</strong>ompar<strong>i</strong>son of
            Ho<strong>t</strong>el <strong>R</strong>eviews
          </v-tooltip>
        </span>
      </v-app-bar-title>
      <v-btn href="?city=Berlin">Berlin</v-btn>
      <v-btn href="?city=New_York">New York</v-btn>
      <v-btn href="?city=Paris">Paris</v-btn>
    </v-app-bar>
    <v-navigation-drawer permanent location="right" width="344" elevation="2">
      <Personalization />
    </v-navigation-drawer>
    <v-main class="mt-12" :style="`background-image: linear-gradient(
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.1) 50%,
            rgba(255, 255, 255, 1) 100%
          ),
          url('${city.img?.url}');`">
      <div class="content mx-auto">
        <div class="text-h1 my-16" id="city-name">
          {{ city.name }}
        </div>
        <v-card class="typewriter-container">
          <div class="typewriter">
            Choose your preferences, select some hotels, and compare them.
          </div>
        </v-card>
        <div class="text-right text-caption attribution">
          Image by
          <a :href="city.img?.href">{{ city.img?.attribution }}</a>
          ({{ city.img?.license }})
        </div>
        <div v-for="section in sections" :key="section.title" class="py-6" :id="section.id" :class="{
          'text-disabled':
            section.id != 'map' && hotelStore.selectedHotelIds.length < 2,
        }">
          <div class="text-h4 mb-4 pt-16">
            <v-icon :icon="section.icon" class="mr-2"></v-icon>{{ section.title }}
          </div>
          <div class="text-subtitle mb-4">{{ section.subtitle }}</div>
          <component v-if="section.component" :is="section.component"></component>
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
  background-size: 100%;
  background-position-x: center;
  background-position-y: center;

  & .attribution {
    opacity: 0.3;
  }

  & .typewriter-container {
    padding: 1rem 2rem;
    margin-bottom: 2rem;

    & .typewriter {
      // source: https://css-tricks.com/snippets/css/typewriter-effect/
      font-family: monospace;
      overflow: hidden;
      /* Ensures the content is not revealed until the animation */
      white-space: nowrap;
      /* Keeps the content on a single line */
      margin: 0 auto;
      /* Gives that scrolling effect as the typing happens */
      letter-spacing: 0.17em;
      /* Adjust as needed */
      animation: typing 8s steps(68, end);
      font-size: 1.2rem;
    }
  }

  /* The typing effect */
  @keyframes typing {
    from {
      width: 0;
    }

    to {
      width: 100%;
    }
  }
}

.content {
  max-width: 1000px;
  margin-top: 500px;

  & .text-h4 {
    margin-left: -0.5rem;
  }

  & .text-subtitle {
    font-size: 1.2rem;
    color: grey
  }
}

.hover {
  background: var(--lt-color-background-dark);
}

div,
p {
  cursor: default;
}
</style>
