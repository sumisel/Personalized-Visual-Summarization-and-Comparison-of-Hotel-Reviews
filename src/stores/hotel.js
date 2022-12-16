import { defineStore } from 'pinia'

export const useHotelStore = defineStore({
  id: 'hotel',
  state: () => ({
    hotels: [{
      id: "A",
      name: "Hilton",
      statement: "Modern and convenient",
      ratings: {
        location: 4.5,
        value: 4.2,
        room: 3.7,
        service: 4.5,
        clean: 4.0,
        sleep: 4.9,
      },
    }, {
      id: "B",
      name: "Grand Central",
      statement: "The old lady",
      ratings: {
        location: 4.5,
        value: 4.1,
        room: 3.3,
        service: 3.7,
        clean: 3.9,
        sleep: 4.8,
      },
    }, {
      id: "C",
      name: "Monopol",
      statement: "Where the high society meets",
      ratings: {
        location: 4.0,
        value: 4.1,
        room: 3.8,
        service: 4.2,
        clean: 3.0,
        sleep: 4.5,
      },
    }]
  }),
})
