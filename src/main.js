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
import { useCategoryStore } from "./stores/category.js";
import { useReviewStore} from "./stores/review.js";
import { useClusterStore } from "./stores/cluster.js";
import { useTimeStore} from "./stores/ratings_over_time.js";
const cityStore = useCityStore(pinia);
const hotelStore = useHotelStore(pinia);
const categoryStore = useCategoryStore(pinia);
const reviewStore = useReviewStore(pinia);
const clusterStore = useClusterStore(pinia);
const timeStore = useTimeStore(pinia);

// set city and load data
const params = new URL(document.location).searchParams;
const cityId = params.get("city") ? params.get("city") : "Berlin";
cityStore.setCity(cityId);
hotelStore.loadHotels(cityId).then(r => {
    // trigger loading of data that depends on category values
    categoryStore.categoriesById["location"].value = 40;
    categoryStore.categoriesById["location"].value = 50
    // trigger loading of data that depends on hotel selection
    //hotelStore.hotels[0].isSelected = 0;
    //hotelStore.hotels[0].isSelected = 1;
});

// create and mount App
const app = createApp(App)
app.use(vuetify)
app.use(pinia)
app.mount('#app')
