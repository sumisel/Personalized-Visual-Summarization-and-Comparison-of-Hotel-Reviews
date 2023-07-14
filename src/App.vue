<script setup>
import { inject, ref } from "vue";

import Welcome from "./components/Welcome.vue";
import Personalization from "./components/Personalization.vue";
import Map from "./components/Map.vue";
import Instruction from "./components/Instruction.vue";
import RatingsSection from "./components/RatingsSection.vue";
import PosNeg from "./components/PosNeg.vue";
import Trending from "./components/Trending.vue";

import { useHotelStore } from "./stores/hotel.js";
const hotelStore = useHotelStore();
import { useInterfaceStore } from "./stores/interface.js";
const interfaceStore = useInterfaceStore();

const sections = [
  {
    id: "ratings",
    title: "Customer Ratings",
    subtitle: "How do the hotels compare across review categories?",
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

const scrollY = ref();

const noTutorial = inject("noTutorial");
if (noTutorial) {
  interfaceStore.tutorialStep.init = false;
} else {
  // open welcome overlay after text animation is finished
  setTimeout(() => {
    interfaceStore.tutorialStep.init = false;
    interfaceStore.tutorialStep.welcome = true;
  }, 5000);
}

window.addEventListener('scroll', () => {
  scrollY.value = window.scrollY;
});

const scrollTo = (hash) => {
  const element = document.getElementById(hash);
  if (!element) return;
  element.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
};

function comparisonSectionVisible() {
  const comparisonSection = document.getElementById('comparison');
  if (!comparisonSection) return false;
  const comparisonSectionTop = comparisonSection.getBoundingClientRect().top;
  return comparisonSectionTop < scrollY.value - window.innerHeight / 2;
};

</script>

<template>
  <v-app>
    <v-app-bar>
      <img src="/logo.png" alt="logo" class="mr-2 ml-4" height="48" />
      <v-app-bar-title>
        <a href=".">
          ViSCitR
          <v-tooltip activator="parent" location="right">
            <strong>Vi</strong>sual <strong>S</strong>ummarization and
            <strong>C</strong>ompar<strong>i</strong>son of
            Ho<strong>t</strong>el <strong>R</strong>eviews
          </v-tooltip>
        </a>
      </v-app-bar-title>
      <v-btn href="?city=Berlin&noTutorial=true">Berlin</v-btn>
      <v-btn href="?city=New_York&noTutorial=true">New York</v-btn>
      <v-btn href="?city=Paris&noTutorial=true">Paris</v-btn>
    </v-app-bar>
    <Welcome v-if="!city" />
    <v-navigation-drawer permanent location="left" width="344" elevation="2" v-if="city">
      <Personalization />
    </v-navigation-drawer>
    <v-main v-if="city" class="mt-12" :style="`background-image: linear-gradient(
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
          <v-overlay activator="parent" v-model="interfaceStore.tutorialStep.welcome" scroll-strategy="block"
            location-strategy="connected" :open-on-click="false" offset="10" persistent>
            <v-card class="pa-2">
              <v-card-actions>
                <v-btn text @click="interfaceStore.tutorialStep.welcome = false; interfaceStore.tutorialStep.poi = true;">
                  <v-icon icon="mdi-check" class="mr-2"></v-icon> Please
                  guide me through.</v-btn>
                <v-btn text @click="interfaceStore.tutorialStep.welcome = false;"><v-icon icon="mdi-close"
                    class="mr-2"></v-icon> Thanks, I don't need a tutorial.</v-btn>
              </v-card-actions>
            </v-card>
          </v-overlay>
        </v-card>
        <div class="text-right text-caption attribution">
          Image by
          <a :href="city.img?.href">{{ city.img?.attribution }}</a>
          ({{ city.img?.license }})
        </div>
        <div v-show="!interfaceStore.isTutorialActive">
          <div class="text-h4">II. Hotel Selection</div>
          <Map id="map"></Map>
        </div>
        <div v-show="!interfaceStore.isTutorialActive" id="comparison">
          <div class="text-h4">III. Hotel Comparison</div>
          <Instruction headerInstruction v-if="hotelStore.selectedHotelIds.length < 2">
            <v-icon icon="mdi-arrow-up" class="inline"></v-icon> Select at least two hotels in the map above to compare
            them below. <v-icon icon="mdi-arrow-down" class="inline"></v-icon>
          </Instruction>
          <div v-for="section in sections" :key="section.title" class="py-6" :id="section.id" :class="{
            'text-disabled':
              hotelStore.selectedHotelIds.length < 2,
          }">
            <div class="text-h5 mb-4 pt-16">
              <v-icon :icon="section.icon" class="mr-2"></v-icon>{{ section.title }}
            </div>
            <div class="text-subtitle mb-4">{{ section.subtitle }}</div>
            <component v-if="section.component" :is="section.component"></component>
          </div>
        </div>
      </div>
    </v-main>
    <div class="overlay-navigation">
      <v-slide-y-transition>
        <v-btn icon @click="scrollTo('comparison')"
          v-show="hotelStore.selectedHotelIds.length > 1 && !comparisonSectionVisible()">
          <v-icon>mdi-arrow-down</v-icon>
          <v-tooltip activator="parent">
            <span>Scroll to hotel comparison</span>
          </v-tooltip>
        </v-btn>
      </v-slide-y-transition>
    </div>
  </v-app>
</template>

<style lang="scss">
@import "./styles/global.scss";

header {
  .v-toolbar-title {
    font-size: 2.2rem;
  }

  & a {
    color: inherit;
    text-decoration: none;
  }
}

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
    margin-bottom: 4rem;

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
      animation: typing 5s steps(68, end);
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

  & .content {
    max-width: 1000px;
    margin-top: 400px;

    & .text-h1 {
      text-shadow: 0 0 50px white;
    }

    & .text-h4 {
      margin-top: 10rem;
      margin-bottom: 2rem;
    }

    & .text-subtitle {
      font-size: 1.2rem;
      color: grey
    }
  }
}



.hover {
  background: var(--lt-color-background-dark);
}

div,
p {
  cursor: default;
}

#app .text-h4 {
  font-size: 1.9rem !important;
}

.v-overlay__scrim {
  background-color: transparent !important;
}

.v-overlay .v-card {
  @include instructions;
}

.overlay-navigation {
  position: fixed;
  bottom: 0;
  right: 0;
  padding: 1rem;
  z-index: 2000;

  & .v-btn {
    @include instructions;
  }

}
</style>
