import { defineStore } from 'pinia'

export const useCategoryStore = defineStore({
  id: 'category',
  state: () => ({
    categories: [{
      name: "Sleep quality",
      icon: "mdi-sleep",
    },
    {
      name: "Rooms",
      icon: "mdi-bed-king",
    },
    {
      name: "Service",
      icon: "mdi-room-service",
    },
    {
      name: "Cleanliness",
      icon: "mdi-broom",
    },
    {
      name: "Location",
      icon: "mdi-crosshairs-gps",
    },
    ]
  }),
})

// "sleep quality":4.0,
// #      "value":4.0,
// #      "rooms":3.0,
// #      "service":5.0,
// #      "cleanliness":3.0,
// #      "location":3.0
