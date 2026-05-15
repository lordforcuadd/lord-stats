<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useSummonerStore } from "../stores/useSummoner";
import ProfileHeader from "../components/summoner/ProfileHeader.vue";
import RankCard from "../components/summoner/RankCard.vue";
import MatchCard from "../components/match/MatchCard.vue";
import { Icon } from "@iconify/vue";
import MasteryCard from "../components/summoner/MasteryCard.vue";
import MatchSummary from "../components/match/MatchSummary.vue";

const route = useRoute();
const router = useRouter();
const summonerStore = useSummonerStore();

const miniQuery = ref("");

const loadData = () => {
  const { region, gameName, tagLine } = route.params;
  if (region && gameName && tagLine) {
    summonerStore.fetchSummoner(region, gameName, tagLine);
  }
};

onMounted(() => {
  loadData();
});

watch(
  () => route.params,
  () => {
    loadData();
  },
  { deep: true },
);

const handleMiniSearch = () => {
  if (!miniQuery.value.includes("#")) return;
  const [name, tag] = miniQuery.value.split("#");
  router.push({
    name: "profile",
    params: { region: route.params.region, gameName: name, tagLine: tag },
  });
  miniQuery.value = "";
};

const goBack = () => router.push({ name: "home" });
</script>

<template>
  <main class="min-h-screen bg-[#0a0a0c] text-white">
    <header
      class="w-full bg-[#1e1e24] border-b border-gray-700/50 p-4 sticky top-0 z-50 shadow-lg"
    >
      <div
        class="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4"
      >
        <router-link
          to="/"
          class="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0"
        >
          <span class="text-2xl font-black tracking-tighter text-white">
            <span class="text-blue-500">Lord</span>Stats
          </span>
        </router-link>

        <form
          @submit.prevent="handleMiniSearch"
          class="w-full md:w-96 relative"
        >
          <input
            v-model="miniQuery"
            type="text"
            placeholder="Buscar otro invocador de la misma region"
            class="w-full bg-[#0a0a0c] border border-gray-700 text-sm py-2 px-4 pr-10 rounded-xl focus:border-blue-500 outline-none transition-all placeholder:text-gray-600"
          />
          <button
            type="submit"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-400 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>
        </form>
      </div>
    </header>

    <div class="p-4 md:p-8 max-w-[1200px] mx-auto">
      <div
        v-if="summonerStore.isLoading"
        class="flex flex-col items-center justify-center py-32"
      >
        <div
          class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"
        ></div>
        <p class="text-gray-400 font-medium animate-pulse">
          Analizando estadísticas...
        </p>
      </div>

      <div
        v-else-if="summonerStore.error"
        class="flex flex-col items-center justify-center py-20"
      >
        <div
          class="bg-red-900/10 border border-red-800/50 p-8 rounded-2xl max-w-lg mx-auto text-center shadow-2xl"
        >
          <Icon
            icon="lucide:triangle-alert"
            class="w-16 h-16 text-red-500 mx-auto mb-4"
          />
          <h2 class="text-2xl font-black text-white mb-2">
            Invocador no encontrado
          </h2>
          <p class="text-gray-300">{{ summonerStore.error }}</p>
          <button
            @click="goBack"
            class="mt-6 bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-800/50 px-6 py-2 rounded-lg transition-all font-bold"
          >
            Volver al buscador
          </button>
        </div>
      </div>

      <div
        v-else-if="summonerStore.accountData"
        class="transition-all animate-fade-in"
      >
        <ProfileHeader
          :account-data="summonerStore.accountData"
          :region="route.params.region"
        />

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-1 flex flex-col gap-6">
            <RankCard :league-data="summonerStore.leagueData" />
            <MasteryCard :masteries="summonerStore.masteries" />
          </div>

          <div class="lg:col-span-2 flex flex-col gap-4">
            <h2
              class="text-xl font-bold mb-2 flex items-center gap-2 text-gray-200"
            >
              <span class="w-1.5 h-6 bg-blue-500 rounded-full"></span> Últimas
              Partidas
            </h2>
            <MatchSummary
              v-if="summonerStore.matches.length > 0"
              :matches="summonerStore.matches"
            />
            <div
              v-if="summonerStore.matches.length === 0"
              class="text-gray-500 text-sm"
            >
              Buscando historial...
            </div>
            <MatchCard
              v-for="match in summonerStore.matches"
              :key="match.id"
              :match="match"
            />

            <button
              v-if="
                summonerStore.matches.length > 0 &&
                summonerStore.currentMatchIndex <
                  summonerStore.matchIdsList.length
              "
              @click="summonerStore.loadMoreMatches"
              :disabled="summonerStore.isLoadingMore"
              class="w-full mt-2 py-3 rounded-xl bg-[#1c1c22] border border-gray-700/50 hover:bg-[#25252b] transition-colors text-sm font-bold text-gray-300 disabled:opacity-50 flex justify-center items-center gap-2"
            >
              <span
                v-if="summonerStore.isLoadingMore"
                class="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"
              ></span>
              {{
                summonerStore.isLoadingMore
                  ? "Cargando partidas..."
                  : "Ver más partidas"
              }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
