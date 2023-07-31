import { defineStore } from 'pinia'

export const useClusterStore = defineStore({
  id: 'cluster',
  state: () => ({
    clusters: []
  }),
  actions: {
    noClusterHovered() {
      for(let i = 0; i < this.clusters.length; i++) {
        if(this.clusters[i]['hover']) {
          return false;
        }
      }
      return true;
    },
    hover(clusterId) {
      this.unhover();
      this.clusters.find(c => c["id"] == clusterId)['hover'] = true;
    },
    unhover() {
      this.clusters.forEach(cluster => { cluster['hover'] = false });
    },
    isHovered(id) {
      return this.clusters.find(c => c["id"] == id)['hover'];
    },
    initClusters(data) {
      Object.keys(data).forEach(hotel => {
        Object.keys(data[hotel]['pos_summary']).forEach(categoryId => {
          data[hotel]['pos_summary'][categoryId].forEach(sentence => {
              const cluster = {"id": sentence['cluster'], "hover": false};
              if (!this.clusters.find(c => c["id"] == cluster['id'])) {
                this.clusters.push(cluster);
              }
          })
        });

        Object.keys(data[hotel]['neg_summary']).forEach(categoryId => {
          data[hotel]['neg_summary'][categoryId].forEach(sentence => {
              const cluster = {"id": sentence['cluster'], "hover": false};
              if (!this.clusters.find(c => c["id"] == cluster['id'])) {
                this.clusters.push(cluster);
              }
          })
        });
      });

    }
  },
})
