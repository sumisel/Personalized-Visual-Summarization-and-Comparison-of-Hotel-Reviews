import { defineStore } from 'pinia'

export const useReviewStore = defineStore({
  id: 'review',
  state: () => ({
    reviews: {},
  }),
  getters: {
    reviewsById: (state) => state.reviews,
  },
  actions: {
    initReviews(data) {
      this.reviews = {};
      data.forEach(item => {
        this.reviews[item['id']] = item['reviews'];
      })
    }
  },
})
