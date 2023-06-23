import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@mdi/font/css/materialdesignicons.css'
import mitt from 'mitt';
const emitter = mitt();
import App from './App.vue'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
    components,
    directives,
})

// set up Pinia 
const pinia = createPinia();
import { useHotelStore } from "./stores/hotel.js";
import { useCategoryStore } from "./stores/category.js";
import { useClusterStore } from "./stores/cluster.js";
import { useTimeStore } from "./stores/ratings_over_time.js";
const hotelStore = useHotelStore(pinia);
const categoryStore = useCategoryStore(pinia);
const clusterStore = useClusterStore(pinia);
const timeStore = useTimeStore(pinia);


// create App
const app = createApp(App)
app.use(vuetify)
app.use(pinia)
app.config.globalProperties.emitter = emitter;
const globals = app.config.globalProperties
export { globals }

// set city and load data
const params = new URL(document.location).searchParams;
const cityId = params.get("city") ? params.get("city") : "Berlin";
import cities from "./assets/cities.json"
app.config.globalProperties.$city = cities[cityId];
import hotelMeta from "./assets/hotel_meta.json"
app.provide("hotelMeta", hotelMeta[cityId])
import poiMeta from "./assets/poi_meta.json"
// TODO: switch to provide/inject
app.config.globalProperties.$poiMeta = poiMeta;
// TODO: avoid this hack
hotelStore.initHotels(cityId, hotelMeta[cityId])
    .then(r => {
        // trigger loading of data that depends on category values
        const tmp = categoryStore.categoriesById["location"].value;
        categoryStore.categoriesById["location"].value = 40;
        categoryStore.categoriesById["location"].value = tmp;
        // trigger loading of data that depends on hotel selection
        //hotelStore.hotels[0].isSelected = 0;
        //hotelStore.hotels[0].isSelected = 1;
    });

// load reviews
const result = await fetch("/HotelRec_subset_" + cityId + "_10_reviews.json");
const data = await result.json();
Object.keys(data).map(key => {
    const elem = data[key];
    elem['review_count'] = Object.keys(elem['reviews']).length;
    elem['reviews_unannotated'] = []; // we don't need that for now
    return elem;
});
// TODO: switch to provide/inject
app.config.globalProperties.$reviews = data;

// mount App
app.mount('#app');
