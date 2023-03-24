import { defineStore } from 'pinia'

export const useClusterStore = defineStore({
  id: 'cluster',
  state: () => ({
    clusters: []
  }),
  getters: {
    clustersById: (state) => Object.fromEntries(state.clusters.map(cluster => [cluster.id, cluster])),
    hoveredCluster: (state) => state.clusters.reduce((hoveredCluster, cluster) => cluster.hover ? cluster : hoveredCluster, {}),
  },
  actions: {
    noClusterHovered(categoryId) { return this.clusters.reduce((notHovered, cluster) => notHovered = notHovered && (!cluster.id.startsWith(categoryId) || !cluster.hover), true)},
    hover(clusterId) {
      this.unhover();
      this.clustersById[clusterId].hover = true;
    },
    unhover() {
      this.clusters.forEach(cluster => { cluster.hover = false });
    },
    initClusters(hotels) {
      hotels.forEach(hotel => {
        hotel.pos_summary.forEach(pos => {
          const cluster = {"id": pos.cluster, "hover": false};
          if (!this.clustersById[cluster.id]) {
            this.clusters.push(cluster);
          }
        })
        hotel.neg_summary.forEach(neg => {
          const cluster = {"id": neg.cluster, "hover": false};
          if (!this.clustersById[cluster.id]) {
            this.clusters.push(cluster);
          }
        })
        for (let [k,v] of Object.entries(hotel.pos_summary_category)) {
          v.forEach(cat => {
            const cluster = {"id": cat.cluster, "hover": false};
            if (!this.clustersById[cluster.id]) {
              this.clusters.push(cluster);
            }
          })
        }
        for (let [k,v] of Object.entries(hotel.neg_summary_category)) {
          v.forEach(cat => {
            const cluster = {"id": cat.cluster, "hover": false};
            if (!this.clustersById[cluster.id]) {
              this.clusters.push(cluster);
            }
          })
        }
      })
    }
  },
})
