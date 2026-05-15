<template>
  <main
    class="min-h-screen bg-[#0a0a0c] text-white flex flex-col items-center p-4 relative overflow-x-hidden pt-12 md:pt-20 pb-20"
  >
    <div
      class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"
    ></div>

    <div
      class="z-10 w-full max-w-5xl flex flex-col items-center animate-fade-in"
    >
      <div class="mb-10 text-center">
        <h1
          class="text-5xl md:text-6xl font-black mb-2 tracking-tighter flex items-center justify-center gap-3"
        >
          <span
            class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300"
            >LORD</span
          >
          STATS
        </h1>
        <p class="text-gray-400 font-medium text-sm md:text-base">
          Herramienta avanzada de League of Legends. Creada por lordforcuadd.
        </p>
      </div>

      <form
        @submit.prevent="handleSearch"
        class="w-full max-w-2xl relative shadow-2xl shadow-blue-900/20 mb-4"
      >
        <div
          class="flex flex-col md:flex-row bg-[#1e1e24] rounded-2xl border border-gray-700/50 overflow-hidden focus-within:border-blue-500 transition-colors"
        >
          <div
            class="relative bg-[#2a2a32] border-b md:border-b-0 md:border-r border-gray-700/50"
          >
            <select
              v-model="selectedRegion"
              class="appearance-none bg-transparent text-gray-200 font-bold py-4 pl-6 pr-10 w-full md:w-32 outline-none cursor-pointer hover:text-white transition-colors"
            >
              <option value="la2" class="bg-[#2a2a32] text-white">LAS</option>
              <option value="la1" class="bg-[#2a2a32] text-white">LAN</option>
              <option value="na1" class="bg-[#2a2a32] text-white">NA</option>
              <option value="euw1" class="bg-[#2a2a32] text-white">EUW</option>
              <option value="kr" class="bg-[#2a2a32] text-white">KR</option>
              <option value="br1" class="bg-[#2a2a32] text-white">BR</option>
            </select>
            <div
              class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
            >
              ▼
            </div>
          </div>

          <input
            v-model="searchQuery"
            type="text"
            placeholder="Riot ID (ej. lordforcuadd#4444)"
            class="flex-1 bg-transparent text-white font-medium px-6 py-4 outline-none placeholder:text-gray-500 w-full"
            autocomplete="off"
            required
          />

          <button
            type="submit"
            class="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 transition-colors flex items-center justify-center md:w-auto w-full"
          >
            <span class="md:hidden mr-2">Buscar</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.3-4.3"></path>
            </svg>
          </button>
        </div>
      </form>

      <p
        v-if="inputError"
        class="text-red-400 text-sm mb-6 font-medium flex items-center gap-1 animate-fade-in"
      >
        ⚠️ {{ inputError }}
      </p>

      <div
        v-if="recentSearches.length > 0"
        class="mb-16 w-full flex flex-col items-center"
      >
        <p
          class="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3"
        >
          Búsquedas Recientes
        </p>
        <div class="flex flex-wrap justify-center gap-2">
          <button
            v-for="(search, index) in recentSearches"
            :key="index"
            @click="quickSearch(search)"
            class="flex items-center gap-1.5 bg-[#1e1e24]/60 hover:bg-[#2a2a32] border border-gray-700/50 px-3 py-1.5 rounded-lg transition-all group"
          >
            <span class="text-[10px] font-bold text-blue-400 uppercase">{{
              search.region
            }}</span>
            <span
              class="text-xs font-medium text-gray-300 group-hover:text-white"
              >{{ search.gameName }}</span
            >
            <span class="text-[10px] text-gray-500 group-hover:text-gray-400"
              >#{{ search.tagLine }}</span
            >
          </button>
        </div>
      </div>

      <div class="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        <a
          :href="patchNotesUrl"
          target="_blank"
          class="group bg-gradient-to-br from-[#1c1c22] to-[#0a0a0c] p-6 rounded-2xl border border-gray-800 hover:border-blue-500/50 transition-all shadow-xl flex flex-col justify-between"
        >
          <div>
            <div class="flex justify-between items-start mb-4">
              <span
                class="bg-blue-500/10 text-blue-400 text-[10px] font-black px-2 py-1 rounded border border-blue-500/20"
                >ACTUALIZACIÓN LIVE</span
              >
              <span
                class="text-gray-600 group-hover:text-blue-400 transition-colors"
                >↗</span
              >
            </div>
            <h3 class="text-lg font-black mb-1">
              Notas del Parche {{ patchVersion }}
            </h3>
            <p class="text-gray-500 text-xs leading-relaxed">
              Consulta los últimos bufos, nerfeos y cambios al meta directamente
              de Riot Games.
            </p>
          </div>
        </a>

        <div
          class="md:col-span-1 bg-[#1c1c22] p-6 rounded-2xl border border-gray-800 shadow-xl"
        >
          <h3
            class="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2"
          >
            <span
              class="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"
            ></span>
            Rotación Gratuita
          </h3>
          <div v-if="globalStore.isLoading" class="text-xs text-gray-500">
            Cargando rotación...
          </div>
          <div v-else class="flex flex-wrap gap-1.5">
            <img
              v-for="champ in globalStore.freeRotation.slice(0, 10)"
              :key="champ"
              :src="getChampionIconUrl(champ)"
              :title="champ"
              class="w-9 h-9 rounded bg-black border border-gray-700 opacity-60 hover:opacity-100 hover:-translate-y-1 hover:border-gray-500 transition-all cursor-crosshair"
            />
          </div>
        </div>

        <div
          class="bg-[#1c1c22] p-6 rounded-2xl border border-gray-800 shadow-xl flex flex-col justify-between"
        >
          <div>
            <h3
              class="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="text-gray-500"
              >
                <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                <line x1="6" y1="6" x2="6.01" y2="6"></line>
                <line x1="6" y1="18" x2="6.01" y2="18"></line>
              </svg>
              Servidor {{ selectedRegion.toUpperCase() }}
            </h3>
            <div v-if="globalStore.serverStatus">
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-bold text-gray-300">{{
                  globalStore.serverStatus.name
                }}</span>
                <span
                  class="px-2 py-1 rounded text-[9px] font-black tracking-wider"
                  :class="
                    isServerDown
                      ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                      : 'bg-green-500/10 text-green-500 border border-green-500/20'
                  "
                >
                  {{ isServerDown ? "MANTENIMIENTO" : "OPERATIVO" }}
                </span>
              </div>
            </div>
            <div
              v-else-if="globalStore.isLoading"
              class="text-xs text-gray-500"
            >
              Comprobando estado...
            </div>
            <div v-else class="text-xs text-red-400">
              Error al conectar con Riot.
            </div>
          </div>
          <p class="text-[9px] text-gray-600 mt-4 leading-tight">
            El estado de salud corresponde a la región seleccionada en el
            buscador superior.
          </p>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useGlobalStore } from "../stores/useGlobal";
import { DD_VERSION, getChampionIconUrl } from "../utils/dataDragon";

const router = useRouter();
const globalStore = useGlobalStore();

const selectedRegion = ref("la2");
const searchQuery = ref("");
const inputError = ref("");
const recentSearches = ref([]);

const patchVersion = computed(() => {
  const parts = DD_VERSION.value.split(".");
  if (parts.length >= 2) {
    const yearPatch = parseInt(parts[0]) + 10;
    return `${yearPatch}.${parts[1]}`;
  }
  return DD_VERSION.value;
});

const patchNotesUrl = computed(() => {
  const versionParts = DD_VERSION.value.split(".");
  if (versionParts.length >= 2) {
    const yearPatch = parseInt(versionParts[0]) + 10;
    return `https://www.leagueoflegends.com/es-mx/news/game-updates/league-of-legends-patch-${yearPatch}-${versionParts[1]}-notes/`;
  }
  return "https://www.leagueoflegends.com/es-mx/news/game-updates/";
});

const isServerDown = computed(() => {
  if (!globalStore.serverStatus) return false;

  const activeMaintenance = globalStore.serverStatus.maintenances?.some(
    (m) => m.maintenance_status === "in_progress",
  );

  const activeIncident = globalStore.serverStatus.incidents?.some(
    (i) =>
      i.incident_severity === "critical" || i.incident_severity === "warning",
  );

  return activeMaintenance || activeIncident;
});

watch(selectedRegion, (newRegion) => {
  globalStore.fetchHomeData(newRegion);
});

onMounted(() => {
  const history = localStorage.getItem("nexusTracker_history");
  if (history) {
    recentSearches.value = JSON.parse(history);
  }

  globalStore.fetchHomeData(selectedRegion.value);
});

const handleSearch = () => {
  inputError.value = "";
  const query = searchQuery.value.trim();

  if (!query.includes("#")) {
    inputError.value = "Debes incluir el tag (ejemplo: Nombre#Tag)";
    return;
  }

  const [gameName, tagLine] = query.split("#");

  if (!gameName || !tagLine) {
    inputError.value = "El formato no es válido.";
    return;
  }

  saveToHistory(selectedRegion.value, gameName, tagLine);
  navigateToProfile(selectedRegion.value, gameName, tagLine);
};

const saveToHistory = (region, gameName, tagLine) => {
  const newSearch = { region, gameName, tagLine };
  let history = recentSearches.value.filter(
    (s) =>
      !(
        s.gameName === gameName &&
        s.tagLine === tagLine &&
        s.region === region
      ),
  );

  history.unshift(newSearch);
  if (history.length > 5) history.pop();

  recentSearches.value = history;
  localStorage.setItem("nexusTracker_history", JSON.stringify(history));
};

const quickSearch = (search) => {
  navigateToProfile(search.region, search.gameName, search.tagLine);
};

const navigateToProfile = (region, gameName, tagLine) => {
  router.push({
    name: "profile",
    params: { region, gameName, tagLine },
  });
};
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
