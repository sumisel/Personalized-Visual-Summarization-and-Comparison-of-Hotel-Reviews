import { defineStore } from 'pinia'

export const useHotelStore = defineStore({
  id: 'hotel',
  state: () => ({
    hotels: [{
      id: "A",
      name: "Hilton",
      statement: "Modern and convenient",
    }, {
      id: "B",
      name: "Grand Central",
      statement: "The old lady"
    }, {
      id: "C",
      name: "Monopol",
      statement: "Where the high society meets"
    }]
  }),
})
