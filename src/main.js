import { createApp } from 'vue'
import '@mdi/font/css/materialdesignicons.css'
import App from './App.vue'

// set up Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
const vuetify = createVuetify({
    components,
    directives,
})

// set up Pinia 
import { createPinia } from 'pinia'
const pinia = createPinia();
import { useHotelStore } from "./stores/hotel.js";
import { useCategoryStore } from "./stores/category.js";
import { useTimeStore } from './stores/ratings_over_time';
import { useClusterStore } from './stores/cluster';
const hotelStore = useHotelStore(pinia);
const categoryStore = useCategoryStore(pinia);
const timeStore = useTimeStore(pinia);
const clusterStore = useClusterStore(pinia);

const debug = false;

// data
console.log("Loading meta data...");
import cities from "./assets/cities.json";
import hotelMeta from "./assets/hotel_meta.json";
import poiMeta from "./assets/poi_meta.json";
console.log("Done loading meta data.")

// create App
const app = createApp(App)
app.use(vuetify)
app.use(pinia)

// set up event emitter
import mitt from 'mitt';
const emitter = mitt();
app.provide("emitter", emitter);

// set city and load city metadata
const params = new URL(document.location).searchParams;
const cityId = params.get("city");

app.provide("city", cityId ? cities[cityId] : null);

if (cityId) {
    app.provide("hotelMeta", hotelMeta[cityId]);
    app.provide("poiMeta", poiMeta);

    const noTutorial = params.get("noTutorial");
    app.provide("noTutorial", noTutorial);

    // load reviews
    console.log("Loading reviews data...");
    const result = await fetch("/HotelRec_subset_" + cityId + "_10_reviews.json");
    const data = await result.json();
    app.provide("reviews", data);
    console.log("Done loading reviews data.");

    if (debug) {
        //select first 4 hotels, for debugging
        Object.keys(data).forEach((key, index) => {
            if(index < 4) {
                hotelStore.selectedHotelIds.push(key);
            }
        });
    }

    clusterStore.initClusters(data);
    clusterStore.emitter = emitter;

    categoryStore.emitter = emitter;

    // load ratings over time
    console.log("Loading ratings over time data...");
    const ratings_time = await fetch("/HotelRec_subset_" + cityId + "_10_average_ratings_over_time.json");
    const ratings_time_data = await ratings_time.json();
    timeStore.initTimeData(Object.keys(hotelMeta[cityId]), ratings_time_data);
    console.log("Done loading ratings over time data.");
}


const keywords = {
    "location": "location area neighborhood district city town street metro subway station distance center close far",
    "sleep": "sleep comfort bed pillow mattress temperature noise quiet",
    "value": "value price cost money breakfast expensive cheap",
    "rooms": "room size space bathroom view",
    "service": "service friendliness staff receptionist reception check-in checkin check-out checkout",
    "cleanliness": "cleanliness clean dirt dirty dust hygiene housekeeping housekeeper maid vacuum",
}

app.provide("keywords", keywords);



// mount app
app.mount('#app');
