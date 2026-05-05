<template>
  <main
    class="min-h-screen bg-[#0a0a0c] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden"
  >
    <div
      class="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"
    ></div>

    <div
      class="z-10 w-full max-w-2xl flex flex-col items-center animate-fade-in"
    >
      <div class="mb-10 text-center">
        <h1
          class="text-5xl font-black mb-2 tracking-tighter flex items-center justify-center gap-3"
        >
          <span
            class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300"
          >
            LORD
          </span>
          STATS
        </h1>
        <p class="text-gray-400 font-medium">
          Herramienta avanzada de League of Legends, Creada y programada por
          lordforcuadd.
        </p>
      </div>

      <form
        @submit.prevent="handleSearch"
        class="w-full relative shadow-2xl shadow-blue-900/20"
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
        class="text-red-400 text-sm mt-3 font-medium flex items-center gap-1 animate-fade-in"
      >
        ⚠️ {{ inputError }}
      </p>

      <div
        v-if="recentSearches.length > 0"
        class="mt-10 w-full flex flex-col items-center"
      >
        <p
          class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4"
        >
          Búsquedas Recientes
        </p>
        <div class="flex flex-wrap justify-center gap-3">
          <button
            v-for="(search, index) in recentSearches"
            :key="index"
            @click="quickSearch(search)"
            class="flex items-center gap-2 bg-[#1e1e24] hover:bg-[#2a2a32] border border-gray-700/50 px-4 py-2 rounded-xl transition-all group"
          >
            <span class="text-xs font-bold text-blue-400 uppercase">{{
              search.region
            }}</span>
            <span
              class="text-sm font-medium text-gray-300 group-hover:text-white"
              >{{ search.gameName }}</span
            >
            <span class="text-xs text-gray-500 group-hover:text-gray-400"
              >#{{ search.tagLine }}</span
            >
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const selectedRegion = ref("la2");
const searchQuery = ref("");
const inputError = ref("");
const recentSearches = ref([]);

onMounted(() => {
  const history = localStorage.getItem("nexusTracker_history");
  if (history) {
    recentSearches.value = JSON.parse(history);
  }
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
