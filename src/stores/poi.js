import { defineStore } from 'pinia';

export const usePoiStore = defineStore({
    id: 'poi',
    state: () => ({
        pois: ['parks and recreation', 'public transport', 'nightlife', 'restaurants', 'shopping', 'sightseeing'],
        selectedPois: [],
    }),
});