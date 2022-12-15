import { defineStore } from 'pinia'

export const useHotelsStore = defineStore({
  id: 'hotels',
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
