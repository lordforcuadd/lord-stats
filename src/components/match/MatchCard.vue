<script setup>
import { computed, ref } from "vue";
import {
  getChampionIconUrl,
  getItemIconUrl,
  getSummonerSpellIconUrl,
} from "../../utils/dataDragon";
import { analyzeMatch } from "../../utils/gemini";
const props = defineProps({
  match: { type: Object, required: true },
});

const isExpanded = ref(false);
const isAnalyzing = ref(false);
const aiAnalysis = ref(null);

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

const handleAIAnalysis = async () => {
  if (aiAnalysis.value) return;

  isAnalyzing.value = true;

  const statsForAI = {
    ...props.match.player,
    gameModeName: formatGameMode.value,
  };

  aiAnalysis.value = await analyzeMatch(statsForAI);
  isAnalyzing.value = false;
};

const roleIcon = computed(() => {
  const pos = props.match.player.teamPosition;

  if (!pos || pos === "Invalid" || pos === "") return null;

  const map = {
    TOP: "top",
    JUNGLE: "jungle",
    MIDDLE: "mid",
    BOTTOM: "adc",
    UTILITY: "support",
  };

  return map[pos]
    ? `https://s-lol-web.op.gg/images/icon/icon-position-${map[pos]}.svg`
    : null;
});

const formatGameMode = computed(() => {
  const queue = props.match.queueId;
  const queueMap = {
    0: "Personalizada",
    400: "Normal",
    420: "Ranked Solo/Dúo",
    430: "Normal (Oculta)",
    440: "Ranked Flex",
    450: "ARAM",
    490: "Quickplay",
    700: "Clash",
    900: "URF",
    1700: "Arena",
  };
  if (queueMap[queue]) return queueMap[queue];
  return props.match.gameMode === "CHERRY" ? "Arena" : "Grieta del Invocador";
});

const matchDuration = computed(
  () =>
    `${Math.floor(props.match.duration / 60)}m ${props.match.duration % 60}s`,
);
const timeAgo = computed(() => {
  const hours = Math.floor((Date.now() - props.match.gameCreation) / 3600000);
  return hours < 24 ? `hace ${hours}h` : `hace ${Math.floor(hours / 24)}d`;
});

const itemsList = computed(() =>
  [0, 1, 2, 3, 4, 5, 6].map((i) => props.match.player[`item${i}`]),
);
const blueTeam = computed(() =>
  props.match.participants.filter((p) => p.teamId === 100),
);
const redTeam = computed(() =>
  props.match.participants.filter((p) => p.teamId === 200),
);

const matchTeams = computed(() => {
  if (props.match.gameMode === "CHERRY") {
    const teamsMap = {};
    props.match.participants.forEach((p) => {
      if (!teamsMap[p.teamId]) teamsMap[p.teamId] = [];
      teamsMap[p.teamId].push(p);
    });
    return Object.values(teamsMap);
  }
  return [blueTeam.value, redTeam.value];
});

const totalCS = computed(
  () =>
    props.match.player.totalMinionsKilled +
    props.match.player.neutralMinionsKilled,
);
const csPerMin = computed(() =>
  (totalCS.value / (props.match.duration / 60)).toFixed(1),
);

const kdaRatio = computed(() => {
  const { kills, deaths, assists } = props.match.player;
  return deaths === 0 ? "Perfecto" : ((kills + assists) / deaths).toFixed(2);
});

const maxDamage = computed(() =>
  Math.max(
    ...props.match.participants.map((p) => p.totalDamageDealtToChampions),
  ),
);
</script>

<template>
  <div
    class="flex flex-col rounded-xl overflow-hidden shadow-sm transition-all border border-riot-border relative"
  >
    <div
      class="relative flex flex-col md:flex-row p-3 items-center gap-4 transition-colors"
      :class="
        match.gameMode === 'CHERRY'
          ? 'bg-[#4a2152]/60'
          : match.player.win
            ? 'bg-[#28344e]/60'
            : 'bg-[#59343b]/60'
      "
    >
      <div
        class="absolute inset-y-0 left-0 w-1.5"
        :class="
          match.gameMode === 'CHERRY'
            ? 'bg-fuchsia-500'
            : match.player.win
              ? 'bg-blue-500'
              : 'bg-red-500'
        "
      ></div>

      <div class="w-24 shrink-0 pl-2">
        <div class="flex items-center gap-1.5 mb-1">
          <p class="font-bold text-xs uppercase text-gray-200">
            {{ formatGameMode }}
          </p>
          <img
            v-if="roleIcon"
            :src="roleIcon"
            class="w-3.5 h-3.5 opacity-70"
            :title="match.player.teamPosition"
          />
        </div>
        <p class="text-[10px] text-gray-400 mb-1">{{ timeAgo }}</p>
        <p
          class="text-xs font-black"
          :class="
            match.gameMode === 'CHERRY'
              ? 'text-fuchsia-400'
              : match.player.win
                ? 'text-blue-400'
                : 'text-red-400'
          "
        >
          {{
            match.gameMode === "CHERRY"
              ? "ARENA"
              : match.player.win
                ? "VICTORIA"
                : "DERROTA"
          }}
        </p>
        <p class="text-[11px] text-gray-500">{{ matchDuration }}</p>
      </div>

      <div class="flex items-center gap-2.5 w-48 shrink-0">
        <div class="relative flex gap-1 items-center">
          <div class="relative">
            <img
              :src="getChampionIconUrl(match.player.championName)"
              class="w-10 h-10 rounded-lg border border-gray-600 object-cover"
              :class="
                match.gameMode === 'CHERRY' ? 'border-fuchsia-500/50' : ''
              "
            />
            <span
              class="absolute -bottom-1 -right-1 bg-black text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-gray-600"
              >{{ match.player.champLevel }}</span
            >
          </div>

          <div v-if="match.gameMode !== 'CHERRY'" class="flex flex-col gap-0.5">
            <img
              :src="getSummonerSpellIconUrl(match.player.spell1Name)"
              class="w-5 h-5 rounded border border-gray-700 shadow-sm"
            />
            <img
              :src="getSummonerSpellIconUrl(match.player.spell2Name)"
              class="w-5 h-5 rounded border border-gray-700 shadow-sm"
            />
          </div>
          <div
            v-else
            class="flex flex-col justify-center items-center h-full pl-1"
          >
            <span
              class="text-[8px] text-fuchsia-300 font-bold bg-fuchsia-900/50 px-1 py-0.5 rounded border border-fuchsia-800"
              >AUGMENTS</span
            >
          </div>
        </div>
        <div class="flex flex-col">
          <p class="font-black tracking-wide text-gray-200 text-sm">
            {{ match.player.kills }}
            <span class="text-gray-500 font-normal">/</span>
            <span class="text-red-400">{{ match.player.deaths }}</span>
            <span class="text-gray-500 font-normal">/</span>
            {{ match.player.assists }}
          </p>
          <p class="text-[10px] text-gray-400">
            <span class="font-bold text-white">{{ kdaRatio }}:1</span> KDA
          </p>
        </div>
      </div>

      <div class="flex-1 flex justify-center md:justify-start">
        <div class="flex gap-0.5 flex-wrap w-[150px]">
          <div
            v-for="(itemId, index) in itemsList"
            :key="index"
            class="w-5 h-5 bg-black/40 rounded border border-gray-700/50"
          >
            <img
              v-if="itemId !== 0"
              :src="getItemIconUrl(itemId)"
              class="w-full h-full object-cover rounded"
              @error="$event.target.style.opacity = '0'"
            />
          </div>
        </div>
      </div>

      <div
        v-if="match.gameMode !== 'CHERRY'"
        class="hidden md:flex gap-4 min-w-[200px]"
      >
        <div class="flex flex-col gap-1 w-24">
          <div
            v-for="player in match.participants.slice(0, 5)"
            :key="player.puuid"
            class="flex items-center gap-1"
          >
            <img
              :src="getChampionIconUrl(player.championName)"
              class="w-4 h-4 rounded-sm"
            />

            <span
              class="text-xs truncate hover:underline cursor-pointer"
              :class="player.isMe ? 'font-bold text-white' : 'text-gray-400'"
            >
              {{
                player.riotIdGameName || player.summonerName || "Desconocido"
              }}
            </span>
          </div>
        </div>

        <div class="flex flex-col gap-1 w-24">
          <div
            v-for="player in match.participants.slice(5, 10)"
            :key="player.puuid"
            class="flex items-center gap-1"
          >
            <img
              :src="getChampionIconUrl(player.championName)"
              class="w-4 h-4 rounded-sm"
            />

            <span
              class="text-xs truncate hover:underline cursor-pointer"
              :class="player.isMe ? 'font-bold text-white' : 'text-gray-400'"
            >
              {{
                player.riotIdGameName || player.summonerName || "Desconocido"
              }}
            </span>
          </div>
        </div>
      </div>
      <button
        @click="toggleExpand"
        class="ml-auto md:ml-0 w-8 h-8 flex items-center justify-center rounded bg-black/20 hover:bg-black/40 text-gray-400 transition-all shrink-0 border border-transparent hover:border-gray-600 cursor-pointer z-10"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="transition-transform duration-300"
          :class="{ 'rotate-180': isExpanded }"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
    </div>

    <div
      v-show="isExpanded"
      class="bg-[#0a0a0c] border-t border-riot-border animate-fade-in"
    >
      <div
        class="px-4 py-3 bg-gradient-to-r from-[#1e1e24] to-[#0a0a0c] border-b border-riot-border flex flex-col md:flex-row items-center justify-between gap-4"
      >
        <div class="flex items-center gap-2">
          <span class="text-xl">✨</span>
          <h3
            class="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500"
          >
            Análisis con Gemini AI
          </h3>
        </div>
        <button
          v-if="!aiAnalysis && !isAnalyzing"
          @click="handleAIAnalysis"
          class="text-xs font-bold px-4 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-full transition-colors flex items-center gap-2 text-white"
        >
          Generar AI Score
        </button>
        <div
          v-else-if="isAnalyzing"
          class="text-xs text-cyan-400 animate-pulse flex items-center gap-2"
        >
          <div
            class="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"
          ></div>
          Analizando rendimiento...
        </div>
        <div
          v-else-if="aiAnalysis"
          class="flex-1 flex items-center gap-4 animate-fade-in"
        >
          <div
            class="flex items-center justify-center w-10 h-10 rounded bg-black/50 border border-gray-700 shrink-0"
          >
            <span
              class="font-black text-lg"
              :class="
                aiAnalysis.score >= 70
                  ? 'text-green-400'
                  : aiAnalysis.score >= 50
                    ? 'text-yellow-400'
                    : 'text-red-400'
              "
              >{{ aiAnalysis.score }}</span
            >
          </div>
          <p class="text-xs text-gray-300 italic leading-tight">
            "{{ aiAnalysis.comment }}"
          </p>
        </div>
      </div>

      <div
        class="grid grid-cols-12 gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider px-4 py-2 bg-black/40 border-b border-riot-border text-center"
      >
        <div class="col-span-4 text-left">Equipo / Jugador</div>
        <div class="col-span-2">KDA</div>
        <div class="col-span-2">Daño a Campeones</div>
        <div class="col-span-1">CS</div>
        <div class="col-span-3 text-left pl-2">Items</div>
      </div>

      <template v-for="(team, teamIndex) in matchTeams" :key="teamIndex">
        <div class="mb-2">
          <div
            class="px-4 py-1.5 text-xs font-bold flex items-center gap-2 border-y"
            :class="
              match.gameMode === 'CHERRY'
                ? 'bg-fuchsia-900/20 text-fuchsia-400 border-fuchsia-900/30 mt-2'
                : teamIndex === 0
                  ? 'bg-blue-900/20 text-blue-400 border-blue-900/30'
                  : 'bg-red-900/20 text-red-400 border-red-900/30 mt-2'
            "
          >
            <span
              class="w-2 h-2 rounded-full"
              :class="
                match.gameMode === 'CHERRY'
                  ? 'bg-fuchsia-500'
                  : teamIndex === 0
                    ? 'bg-blue-500'
                    : 'bg-red-500'
              "
            ></span>
            {{
              match.gameMode === "CHERRY"
                ? `Equipo ${teamIndex + 1}`
                : teamIndex === 0
                  ? "Equipo Azul"
                  : "Equipo Rojo"
            }}
          </div>
          <div
            v-for="p in team"
            :key="p.puuid"
            class="grid grid-cols-12 gap-2 items-center px-4 py-1.5 border-b border-gray-800/50 hover:bg-white/5 transition-colors"
            :class="{ 'bg-white/[0.04]': p.isMe }"
          >
            <div class="col-span-4 flex items-center gap-3">
              <div class="flex gap-1 items-center">
                <img
                  :src="getChampionIconUrl(p.championName)"
                  class="w-8 h-8 rounded-lg border border-gray-700"
                />
                <div
                  v-if="match.gameMode !== 'CHERRY'"
                  class="flex flex-col gap-0.5"
                >
                  <img
                    :src="getSummonerSpellIconUrl(p.spell1Name)"
                    class="w-3.5 h-3.5 rounded border border-gray-800"
                  />
                  <img
                    :src="getSummonerSpellIconUrl(p.spell2Name)"
                    class="w-3.5 h-3.5 rounded border border-gray-800"
                  />
                </div>
              </div>

              <p
                class="text-xs truncate font-medium"
                :class="p.isMe ? 'text-white' : 'text-gray-300'"
              >
                {{ p.riotIdGameName || p.summonerName || "Desconocido" }}
              </p>
            </div>
            <div class="col-span-2 text-center flex flex-col justify-center">
              <p class="text-[11px] text-gray-300">
                {{ p.kills }} <span class="text-gray-600">/</span>
                <span class="text-red-400">{{ p.deaths }}</span>
                <span class="text-gray-600">/</span> {{ p.assists }}
              </p>
              <p class="text-[9px] text-gray-500 font-bold">
                {{
                  p.deaths === 0
                    ? "Perfecto"
                    : ((p.kills + p.assists) / p.deaths).toFixed(2)
                }}:1
              </p>
            </div>
            <div class="col-span-2 flex flex-col justify-center gap-1 px-2">
              <p class="text-[10px] text-center text-gray-300 font-mono">
                {{ p.totalDamageDealtToChampions.toLocaleString() }}
              </p>
              <div
                class="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden"
              >
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :class="
                    match.gameMode === 'CHERRY'
                      ? 'bg-fuchsia-500'
                      : teamIndex === 0
                        ? 'bg-blue-500'
                        : 'bg-red-500'
                  "
                  :style="{
                    width: `${(p.totalDamageDealtToChampions / maxDamage) * 100}%`,
                  }"
                ></div>
              </div>
            </div>
            <div class="col-span-1 text-center flex flex-col justify-center">
              <p class="text-[11px] text-gray-300">
                {{ p.totalMinionsKilled }}
              </p>
            </div>
            <div class="col-span-3 flex gap-0.5 justify-start items-center">
              <div
                v-for="i in 7"
                :key="i"
                class="w-5 h-5 bg-black/40 rounded border border-gray-800 shrink-0"
              >
                <img
                  v-if="p[`item${i - 1}`] !== 0"
                  :src="getItemIconUrl(p[`item${i - 1}`])"
                  class="w-full h-full object-cover rounded"
                  @error="$event.target.style.opacity = '0'"
                />
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
