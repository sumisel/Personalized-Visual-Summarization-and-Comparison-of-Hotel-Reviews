import { defineStore } from 'pinia'

export const useCounterStore = defineStore('hotels', () => {
  const hotels = ["Hilton", "Grand Central", "Monopol"]

  return { hotels }
})
