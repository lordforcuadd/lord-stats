<template>
  <div
    class="bg-[#1c1c22] rounded-xl border border-gray-700/50 overflow-hidden shadow-lg flex flex-col h-full"
  >
    <div class="p-3 border-b border-gray-700/50 bg-[#25252b]">
      <h3 class="text-xs font-bold text-gray-300">Mejores Campeones</h3>
    </div>

    <div class="p-4 flex-1 flex flex-col gap-3">
      <div
        v-if="isLoading"
        class="flex-1 flex items-center justify-center py-10"
      >
        <div
          class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"
        ></div>
      </div>

      <div
        v-else-if="topMasteries.length === 0"
        class="flex-1 flex items-center justify-center py-10 text-gray-500 text-sm font-medium"
      >
        No hay maestrías registradas.
      </div>

      <div
        v-else
        v-for="(mastery, index) in topMasteries"
        :key="mastery.championId"
        class="relative h-20 rounded-lg overflow-hidden border border-gray-700/50 group"
      >
        <img
          :src="mastery.imageUrl"
          class="absolute inset-0 w-full h-full object-cover object-top opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
          @error="$event.target.style.display = 'none'"
        />

        <div
          class="absolute inset-0 bg-gradient-to-r from-[#0a0a0c] via-[#0a0a0c]/80 to-transparent pointer-events-none"
        ></div>

        <div class="absolute inset-0 flex items-center p-3 z-10">
          <div
            class="relative w-10 h-12 flex items-center justify-center shrink-0 mr-3"
          >
            <svg
              class="absolute inset-0 w-full h-full text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2L22 7l-5 14H7L2 7l10-5z" />
            </svg>
            <span
              class="relative text-white font-black text-sm z-10 shadow-black drop-shadow-md"
            >
              {{ mastery.championLevel }}
            </span>
          </div>

          <div class="flex flex-col">
            <h4
              class="text-white font-bold text-lg leading-tight tracking-wide drop-shadow-lg"
            >
              {{ mastery.championName }}
            </h4>
            <p class="text-[11px] text-gray-300 font-medium drop-shadow-md">
              <span class="text-blue-400 font-bold">{{
                formatPoints(mastery.championPoints)
              }}</span>
              Puntos
            </p>
          </div>

          <div
            class="ml-auto text-gray-500/30 font-black text-4xl italic pr-2 select-none group-hover:text-blue-500/20 transition-colors"
          >
            #{{ index + 1 }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { getChampionMap } from "../../utils/dataDragon";

const props = defineProps({
  masteries: { type: Array, default: () => [] },
});

const topMasteries = ref([]);
const championMap = ref({});
const isLoading = ref(true);

const formatPoints = (points) => {
  if (points >= 1000000) {
    return (points / 1000000).toFixed(1) + "M";
  } else if (points >= 1000) {
    return (points / 1000).toFixed(1) + "k";
  }
  return points.toString();
};

const processMasteries = async () => {
  isLoading.value = true;

  if (Object.keys(championMap.value).length === 0) {
    championMap.value = await getChampionMap();
  }

  if (props.masteries && props.masteries.length > 0) {
    const top3 = props.masteries.slice(0, 3);

    topMasteries.value = top3.map((m) => {
      const champName = championMap.value[m.championId] || "Desconocido";

      const imageUrl =
        champName !== "Desconocido"
          ? `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${champName}_0.jpg`
          : "";

      return {
        ...m,
        championName: champName,
        imageUrl: imageUrl,
      };
    });
  } else {
    topMasteries.value = [];
  }

  isLoading.value = false;
};

onMounted(() => {
  processMasteries();
});

watch(
  () => props.masteries,
  () => {
    processMasteries();
  },
  { deep: true },
);
</script>
