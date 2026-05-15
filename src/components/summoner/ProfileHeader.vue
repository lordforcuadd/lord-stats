<template>
  <div
    class="flex flex-col md:flex-row items-center md:items-start gap-6 p-6 md:p-8 bg-gradient-to-r from-[#1e1e24] to-[#0a0a0c] rounded-2xl mb-6 border border-gray-700/50 relative overflow-hidden"
  >
    <div
      class="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[80px] pointer-events-none"
    ></div>

    <div class="relative shrink-0 mt-2">
      <div
        v-if="summonerStore.liveGame"
        class="absolute inset-0 rounded-3xl bg-red-500 animate-ping opacity-20 scale-110"
      ></div>

      <img
        v-if="accountData?.profileIconId !== undefined"
        :src="getProfileIconUrl(accountData.profileIconId)"
        alt="Icono de Perfil"
        class="w-28 h-28 md:w-32 md:h-32 rounded-3xl border-2 object-cover shadow-2xl relative z-10"
        :class="
          summonerStore.liveGame
            ? 'border-red-500 shadow-red-900/40'
            : 'border-gray-600'
        "
      />

      <div
        v-if="accountData?.summonerLevel"
        class="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#0a0a0c] text-white text-xs font-black px-3 py-0.5 rounded-full border border-gray-600 shadow-md z-20"
      >
        {{ accountData.summonerLevel }}
      </div>

      <div
        v-if="accountData?.totalMasteryScore"
        class="absolute -top-3 -right-3 bg-gradient-to-br from-yellow-800 to-yellow-600 text-black text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-[#1e1e24] shadow-lg flex items-center gap-1 z-20"
        title="Puntuación total de maestría"
      >
        <span>⭐</span> {{ accountData.totalMasteryScore }}
      </div>
    </div>

    <div class="flex flex-col items-center md:items-start flex-1 z-10 w-full">
      <h1
        class="text-3xl md:text-4xl font-black text-white flex flex-wrap items-baseline gap-2 justify-center md:justify-start"
      >
        {{ accountData?.gameName }}
        <span class="text-gray-500 text-xl md:text-2xl font-medium"
          >#{{ accountData?.tagLine }}</span
        >
      </h1>

      <div class="flex items-center gap-4 mt-3">
        <p
          class="text-blue-400 font-bold uppercase tracking-widest text-xs bg-blue-500/10 px-3 py-1 rounded-md border border-blue-500/20"
        >
          {{ region }}
        </p>

        <button
          @click="handleUpdate"
          :disabled="isUpdating"
          class="flex items-center gap-2 text-xs bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold px-4 py-1.5 rounded-md transition-colors shadow-lg shadow-blue-600/20"
        >
          <svg
            v-if="isUpdating"
            class="animate-spin h-3.5 w-3.5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {{ isUpdating ? "Actualizando..." : "Actualizar Datos" }}
        </button>
      </div>

      <div
        class="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-5 w-full"
      >
        <div
          v-if="summonerStore.clashData?.length > 0"
          class="flex items-center gap-2.5 bg-blue-900/20 border border-blue-500/30 px-3 py-1.5 rounded-lg"
        >
          <span class="text-lg drop-shadow-md">🏆</span>
          <div class="flex flex-col">
            <span
              class="text-[9px] text-blue-400 font-black uppercase tracking-wider"
              >Equipo Clash</span
            >
            <span class="text-xs text-gray-200 font-bold"
              >Rol: {{ summonerStore.clashData[0].position }}</span
            >
          </div>
        </div>

        <div
          v-if="summonerStore.liveGame"
          class="flex items-center gap-3 bg-red-900/20 border border-red-500/30 px-3 py-1.5 rounded-lg animate-fade-in"
        >
          <div class="flex flex-col">
            <span
              class="text-[9px] font-black text-red-400 uppercase tracking-widest flex items-center gap-1.5"
            >
              <span
                class="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"
              ></span>
              En Vivo
            </span>
            <p class="text-xs font-bold text-gray-200">
              {{ getQueueName(summonerStore.liveGame.gameQueueConfigId) }}
            </p>
          </div>
          <div class="h-6 w-[1px] bg-red-500/30"></div>
          <div class="flex flex-col">
            <span
              class="text-[9px] font-black text-red-400 uppercase tracking-widest"
              >Tiempo</span
            >
            <p class="text-xs font-mono font-bold text-white">
              {{ formatLiveTime(summonerStore.liveGame.gameLength) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { getProfileIconUrl } from "../../utils/dataDragon";
import { useSummonerStore } from "../../stores/useSummoner";

const props = defineProps({
  accountData: { type: Object, required: true },
  region: { type: String, required: true },
});

const getQueueName = (id) => {
  const map = {
    400: "Reclutamiento",
    420: "Solo/Dúo",
    430: "Normal",
    440: "Flex",
    450: "ARAM",
    490: "Partida Rápida",
    700: "Clash",
    720: "ARAM Caos",
    900: "URF",
    1300: "Nexo",
    1700: "Arena",
    1710: "Arena",
  };
  return map[id] || "Modo Especial";
};

const formatLiveTime = (seconds) => {
  if (seconds < 0) return "Cargando...";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

const summonerStore = useSummonerStore();
const isUpdating = ref(false);

const handleUpdate = async () => {
  isUpdating.value = true;

  await summonerStore.fetchSummoner(
    props.region,
    props.accountData.gameName,
    props.accountData.tagLine,
  );
  isUpdating.value = false;
};
</script>
