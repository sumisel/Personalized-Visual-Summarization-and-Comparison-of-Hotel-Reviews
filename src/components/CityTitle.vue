<script setup>
import { inject } from "vue";
import { useInterfaceStore } from "../stores/interface";
const city = inject("city");
const noTutorial = inject("noTutorial");
const interfaceStore = useInterfaceStore();
</script>

<template>
    <div class="text-h1 my-16" id="city-name">
        {{ city.name }}
    </div>
    <v-card class="typewriter-container">
        <div class="typewriter" :class="{ 'animated': !noTutorial }">
            Choose your preferences, select some hotels, and compare them.
        </div>
        <v-overlay activator="parent" v-model="interfaceStore.tutorialStep.welcome" scroll-strategy="block"
            location-strategy="connected" :open-on-click="false" offset="10" persistent class="instructions">
            <v-card class="pa-2">
                <v-card-actions>
                    <v-btn text
                        @click="interfaceStore.tutorialStep.welcome = false; interfaceStore.tutorialStep.poi = true;">
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
</template>

<style scoped lang="scss">
.text-h1 {
    text-shadow: 0 0 50px white;
}

.typewriter-container {
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
        font-size: 1.2rem;

        &.animated {
            animation: typing 5s steps(68, end);
        }
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

.attribution {
    opacity: 0.3;
}
</style>