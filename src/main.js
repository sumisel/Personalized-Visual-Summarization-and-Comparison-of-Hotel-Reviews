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
const hotelStore = useHotelStore(pinia);
const categoryStore = useCategoryStore(pinia);


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

const result = await fetch("/HotelRec_subset_" + cityId + "_10_enriched.txt");
const data = await result.json();

// static data
app.config.globalProperties.$reviews = {};
data.forEach(hotelData => {
//    app.config.globalProperties.$reviews[hotelData['id']] = hotelData['reviews'];
})

data.forEach(hotel => {hotel['review_count']=Object.keys(hotel['reviews']).length; hotel['reviews']=[];hotel['reviews_unannotated']=[];}); // for acceptable page performance, separate reviews from hotels
hotelStore.initHotels(data, cityId)
//hotelStore.loadHotels(cityId)
.then(r => {
    // trigger loading of data that depends on category values
    const tmp = categoryStore.categoriesById["location"].value;
    categoryStore.categoriesById["location"].value = 40;
    categoryStore.categoriesById["location"].value = tmp;
    // trigger loading of data that depends on hotel selection
    //hotelStore.hotels[0].isSelected = 0;
    //hotelStore.hotels[0].isSelected = 1;
});

// mount App
app.mount('#app');
