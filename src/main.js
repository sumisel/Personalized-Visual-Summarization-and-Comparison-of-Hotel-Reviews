import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@mdi/font/css/materialdesignicons.css' 
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
import { useCityStore } from "./stores/city.js";
const cityStore = useCityStore(pinia);
const hotelStore = useHotelStore(pinia);

// set city and load data
const params = new URL(document.location).searchParams;
const cityId = params.get("city") ? params.get("city") : "Berlin";
cityStore.setCity(cityId);
hotelStore.loadHotels(cityId);

// create and mount App
const app = createApp(App)
app.use(vuetify)
app.use(pinia)
app.mount('#app')
