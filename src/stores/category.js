import { defineStore } from 'pinia'

export const useCategoryStore = defineStore({
  id: 'category',
  state: () => ({
    categories: [
      {
        id: "location",
        title: "Location",
        icon: "mdi-crosshairs-gps",
      },
      {
        id: "value",
        title: "Value",
        icon: "mdi-diamond",
      },
      {
        id: "room",
        title: "Rooms",
        icon: "mdi-bed-king",
      },
      {
        id: "service",
        title: "Service",
        icon: "mdi-room-service",
      },
      {
        id: "clean",
        title: "Cleanliness",
        icon: "mdi-broom",
      },
      {
        id: "sleep",
        title: "Sleep quality",
        icon: "mdi-sleep",
      },
    ]
  }),
})
