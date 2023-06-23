import { defineStore } from 'pinia'

export const useClusterStore = defineStore({
  id: 'cluster',
  state: () => ({
    clusters: {}
  }),
  getters: {
    clustersById: (state) => { return (category) => Object.fromEntries(state.clusters[category].map(cluster => [cluster['id'], cluster])) },
    hoveredCluster: (state) => { return (category) => state.clusters[category].reduce((hoveredCluster, cluster) => cluster['hover'] ? cluster : hoveredCluster, {}) },
  },
  actions: {
    noClusterHovered(categoryId) { return this.clusters[categoryId].reduce((notHovered, cluster) => notHovered = notHovered && !cluster['hover'], true) },
    hover(categoryId, clusterId) {
      this.unhover(categoryId);
      this.clustersById(categoryId)[clusterId]['hover'] = true;
    },
    unhover(categoryId) {
      this.clusters[categoryId].forEach(cluster => { cluster['hover'] = false });
    },
    initClusters(hotels) {
      hotels.forEach(hotel => {

        Object.keys(hotel['pos_summary']).forEach(categoryId => {
          if (!(categoryId in this.clusters)) {
            this.clusters[categoryId] = [];
          }
          hotel['pos_summary'][categoryId].forEach(sentence => {
            const cluster = { "id": sentence['cluster'], "hover": false };
            if (!this.clustersById(categoryId)[cluster['id']]) {
              this.clusters[categoryId].push(cluster);
            }
          })
          // sort by cluster id
          //this.clusters[categoryId] = this.clusters[categoryId].sort((a, b) => a['id'] - b['id']);
        });

        Object.keys(hotel['neg_summary']).forEach(categoryId => {
          if (!(categoryId in this.clusters)) {
            this.clusters[categoryId] = [];
          }
          hotel['neg_summary'][categoryId].forEach(sentence => {
            const cluster = { "id": sentence['cluster'], "hover": false };
            if (!this.clustersById(categoryId)[cluster['id']]) {
              this.clusters[categoryId].push(cluster);
            }
          })
          // sort by cluster id
          //this.clusters[categoryId] = this.clusters[categoryId].sort((a, b) => a['id'] - b['id']);
        });
      })
    }
  },
})
