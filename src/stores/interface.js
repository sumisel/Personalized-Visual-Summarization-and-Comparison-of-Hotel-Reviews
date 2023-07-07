import { defineStore } from 'pinia';

export const useInterfaceStore = defineStore({
    id: 'interface',
    state: () => ({
        tutorialState: {
            welcome: true,
        },
    }),
});