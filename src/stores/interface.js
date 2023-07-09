import { defineStore } from 'pinia';

export const useInterfaceStore = defineStore({
    id: 'interface',
    state: () => ({
        tutorialStep: {
            init: true,
            welcome: false,
            poi: false,
        },
    }),
    getters: {
        isTutorialActive: (state) => {
            return Object.values(state.tutorialStep).some((step) => step);
        },
    },
});