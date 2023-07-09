import { defineStore } from 'pinia';

export const usePoiStore = defineStore({
    id: 'poi',
    state: () => ({
        selectedPois: [],
    }),
});