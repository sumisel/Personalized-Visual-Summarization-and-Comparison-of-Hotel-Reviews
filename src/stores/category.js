import { defineStore } from 'pinia'

export const useCategoryStore = defineStore({
  id: 'category',
  state: () => ({
    categories: [
      {
        id: "location",
        title: "Location",
        icon: "mdi-crosshairs-gps",
        value: 50,
      },
      {
        id: "value",
        title: "Value",
        icon: "mdi-diamond-stone",
        value: 50,
      },
      {
        id: "room",
        title: "Rooms",
        icon: "mdi-bed-king",
        value: 50,
      },
      {
        id: "service",
        title: "Service",
        icon: "mdi-room-service",
        value: 50,
      },
      {
        id: "clean",
        title: "Cleanliness",
        icon: "mdi-broom",
        value: 50,
      },
      {
        id: "sleep",
        title: "Sleep quality",
        icon: "mdi-sleep",
        value: 50,
      },
    ]
  }),
})
