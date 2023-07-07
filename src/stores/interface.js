import { defineStore } from 'pinia';

export const useInterfaceStore = defineStore({
    id: 'interface',
    state: () => ({
        tutorialStep: {
            welcome: true,
            poi: false,
        },
    }),
    getters: {
        isTutorialActive: (state) => {
            return Object.values(state.tutorialStep).some((step) => step);
        },
    },
});