import { defineStore } from 'pinia'
import { inject } from "vue";

export const useClusterStore = defineStore({
  id: 'cluster',
  state: () => ({
    clusters: [],
    emitter: Object,
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
      const c = this.clusters.find(c => c["id"] == clusterId);
      c['hover'] = true;

      for(let i = 0; i < c['sentences'].length; i++) {
        const sentence = c['sentences'][i];
        this.emitter.emit(
            "highlight_" + sentence['category'] + "_" + sentence['hotel_id'].replaceAll(".", "_"),
            { categoryId: sentence['category'], hotelId: sentence['hotel_id'], num_items: sentence['cluster_size'], polarity: sentence['polarity'] }
        );
      }
    },
    unhover() {
      for(let i = 0; i < this.clusters.length; i++) {
        this.clusters[i]['hover'] = false;
        for(let j = 0; j < this.clusters[i]['sentences'].length; j++) {
            const sentence = this.clusters[i]['sentences'][j];
            this.emitter.emit(
                "unhighlight_" + sentence['category'] + "_" + sentence['hotel_id'].replaceAll(".", "_"),
                { categoryId: sentence['category'], hotelId: sentence['hotel_id'], num_items: 1, polarity: sentence['polarity'] }
            );
        }
      }
    },
    isHovered(id) {
      return this.clusters.find(c => c["id"] == id)['hover'];
    },
    initClusters(data) {
      Object.keys(data).forEach(hotel => {
        for (let sentiment of ["pos_summary", "neg_summary"]) {
          Object.keys(data[hotel][sentiment]).forEach(categoryId => {
            data[hotel]['pos_summary'][categoryId].forEach(sentence => {
              sentence['hotel_id'] = hotel;
              const cluster = {"id": sentence['cluster'], "hover": false, "sentences": []};
              if (!this.clusters.find(c => c["id"] == cluster['id'])) {
                this.clusters.push(cluster);
              } else {
                this.clusters.find(c => c["id"] == cluster['id'])['sentences'].push(sentence);
              }
            })
          });
        }
      });
    }
  },
})
