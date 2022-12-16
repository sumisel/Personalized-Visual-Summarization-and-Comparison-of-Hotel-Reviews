import { defineStore } from 'pinia'

export const useCategoryStore = defineStore({
  id: 'category',
  state: () => ({
    categories: [
      {
        id: "location",
        title: "Location",
        icon: "mdi-crosshairs-gps",
        color: "#1F77B4",
        value: 50,
      },
      {
        id: "value",
        title: "Value",
        icon: "mdi-diamond-stone",
        color: "#FF7F0E",
        value: 50,
      },
      {
        id: "room",
        title: "Rooms",
        icon: "mdi-bed-king",
        color: "#9467BD",
        value: 50,
      },
      {
        id: "service",
        title: "Service",
        icon: "mdi-room-service",
        color: "#17BECF",
        value: 50,
      },
      {
        id: "clean",
        title: "Cleanliness",
        icon: "mdi-broom",
        color: "#BCBD22",
        value: 50,
      },
      {
        id: "sleep",
        title: "Sleep quality",
        icon: "mdi-sleep",
        color: "#E377C2",
        value: 50,
      },
    ]
  }),
})
