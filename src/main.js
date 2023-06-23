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
import { useTimeStore } from './stores/ratings_over_time'
const hotelStore = useHotelStore(pinia);
const categoryStore = useCategoryStore(pinia);
const timeStore = useTimeStore(pinia);

// create App
const app = createApp(App)
app.use(vuetify)
app.use(pinia)

// set up event emitter
// TODO: check if needed
import mitt from 'mitt';
const emitter = mitt();
app.provide("emitter", emitter);

// set city and load city meta data
const params = new URL(document.location).searchParams;
const cityId = params.get("city") ? params.get("city") : "Berlin";
import cities from "./assets/cities.json"
app.provide("city", cities[cityId])

// load hotel meta data
import hotelMeta from "./assets/hotel_meta.json"
app.provide("hotelMeta", hotelMeta[cityId])

// load POI meta data
import poiMeta from "./assets/poi_meta.json"
app.provide("poiMeta", poiMeta)

// TODO: avoid this hack
hotelStore.initHotels(hotelMeta[cityId])
// trigger loading of data that depends on category values
const tmp = categoryStore.categoriesById["location"].value;
categoryStore.categoriesById["location"].value = 40;
categoryStore.categoriesById["location"].value = tmp;


// load reviews
const result = await fetch("/HotelRec_subset_" + cityId + "_10_reviews.json");
const data = await result.json();
// TODO: check if this is still needed or can be simiplified
Object.keys(data).forEach(key => {
    const elem = data[key];
    elem['review_count'] = Object.keys(elem['reviews']).length;
    elem['reviews_unannotated'] = []; // we don't need that for now
});
app.provide("reviews", data);

// load ratings over time
// TODO: this is a temporary solution, will be replaced when the data is in the enriched data file
const ratings_time = await fetch("/HotelRec_subset_" + cityId + "_10_average_ratings_over_time.json");
const ratings_time_data = await ratings_time.json();
timeStore.initTimeData(Object.keys(hotelMeta), ratings_time_data);

// mount app
app.mount('#app');
