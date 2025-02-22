import { defineStore } from 'pinia';

export const useCategoryStore = defineStore({
  id: 'category',
  state: () => ({
    // colors: selection of Bokeh Category 10 https://colorcet.holoviz.org/user_guide/Categorical.html
    emitter: null,
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
        id: "rooms",
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
        id: "cleanliness",
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
  getters: {
    categoriesById: (state) => Object.fromEntries(state.categories.map(category => [category.id, category])),
    normalizedCategoryValues: (state) => {
      const valueSum = state.categories.reduce((sum, category) => sum += category.value, 0);
      const normalizedValues = {};
      state.categories.forEach(category => {
        normalizedValues[category.id] = category.value / valueSum;
      })
      return normalizedValues
    },
    relevantCategories: (state) => state.categories.filter(category => category.value > 10).sort((a, b) => b.value - a.value),
    normalizedRelevantCategoryValues: (state) => {
      const valueSum = state.relevantCategories.reduce((sum, category) => sum += category.value, 0);
      const normalizedValues = {};
      state.relevantCategories.forEach(category => {
        normalizedValues[category.id] = category.value / valueSum;
      })
      return normalizedValues
    },
    noCategoryHovered: (state) => state.categories.reduce((notHovered, category) => notHovered = notHovered && !category.hover, true),
    hoveredCategory: (state) => state.categories.reduce((hoveredCategory, category) => category.hover ? category : hoveredCategory, { "icon": "mdi-clipboard-check", "title": "", "color": "" }), // TODO return empty icon if no category is hovered
  },
  actions: {
    hover(categoryId) {
      this.unhover();
      this.categoriesById[categoryId].hover = true;
      this.emitter.emit(
          "highlight_" + categoryId,
          { categoryId }
      );
    },
    unhover() {
      this.categories.forEach(category => { category.hover = false });
      this.emitter.emit(
          "unhighlight",
          { }
      );
    },
  },
})
