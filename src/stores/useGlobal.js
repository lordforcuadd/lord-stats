import { defineStore } from "pinia";
import { DD_VERSION, getChampionMap } from "../utils/dataDragon";

export const useGlobalStore = defineStore("global", {
  state: () => ({
    freeRotation: [],
    serverStatus: null,
    isLoading: false,
  }),

  actions: {
    async fetchHomeData(region = "la2") {
      this.isLoading = true;
      try {
        const rotationEndpoint = `/lol/platform/v3/champion-rotations`;
        const statusEndpoint = `/lol/status/v4/platform-data`;

        const [rotRes, statRes] = await Promise.all([
          fetch(`/api-${region}${rotationEndpoint}`),
          fetch(`/api-${region}${statusEndpoint}`),
        ]);

        if (rotRes.ok) {
          const rotData = await rotRes.json();
          const champMap = await getChampionMap();

          this.freeRotation = rotData.freeChampionIds.map((id) => champMap[id]);
        }

        if (statRes.ok) {
          this.serverStatus = await statRes.json();
        }
      } catch (error) {
        console.error("Error cargando datos globales:", error);
      } finally {
        this.isLoading = false;
      }
    },
  },
});
