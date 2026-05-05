<script setup>
import { computed } from "vue";
import { getChampionIconUrl } from "../../utils/dataDragon";

const props = defineProps({
  matches: {
    type: Array,
    required: true,
  },
});

const summary = computed(() => {
  if (!props.matches || props.matches.length === 0) return null;

  let wins = 0;
  let losses = 0;
  let totalKills = 0;
  let totalDeaths = 0;
  let totalAssists = 0;

  props.matches.forEach((match) => {
    if (match.player.win) wins++;
    else losses++;

    totalKills += match.player.kills;
    totalDeaths += match.player.deaths;
    totalAssists += match.player.assists;
  });

  const totalGames = wins + losses;
  const winRate = Math.round((wins / totalGames) * 100);
  const avgKills = (totalKills / totalGames).toFixed(1);
  const avgDeaths = (totalDeaths / totalGames).toFixed(1);
  const avgAssists = (totalAssists / totalGames).toFixed(1);
  const kdaRatio =
    totalDeaths > 0
      ? ((totalKills + totalAssists) / totalDeaths).toFixed(2)
      : "Perfecto";

  return {
    totalGames,
    wins,
    losses,
    winRate,
    avgKills,
    avgDeaths,
    avgAssists,
    kdaRatio,
  };
});

const championsPlayed = computed(() => {
  if (!props.matches) return [];

  const champStats = {};

  props.matches.forEach((match) => {
    const p = match.player;
    const champ = p.championName;

    if (!champStats[champ]) {
      champStats[champ] = {
        name: champ,
        games: 0,
        wins: 0,
        losses: 0,
        kills: 0,
        deaths: 0,
        assists: 0,
      };
    }

    champStats[champ].games++;
    if (p.win) champStats[champ].wins++;
    else champStats[champ].losses++;

    champStats[champ].kills += p.kills;
    champStats[champ].deaths += p.deaths;
    champStats[champ].assists += p.assists;
  });

  return Object.values(champStats)
    .map((c) => {
      const winRate = Math.round((c.wins / c.games) * 100);
      const kda =
        c.deaths > 0
          ? ((c.kills + c.assists) / c.deaths).toFixed(2)
          : "Perfecto";
      return { ...c, winRate, kda };
    })
    .sort((a, b) => b.games - a.games)
    .slice(0, 3);
});
</script>

<template>
  <div
    v-if="summary"
    class="bg-[#1e1e24]/80 border border-riot-border rounded-xl p-4 flex flex-col md:flex-row items-center gap-6 shadow-sm"
  >
    <div class="flex items-center gap-4 w-full md:w-auto">
      <div
        class="relative w-16 h-16 rounded-full flex items-center justify-center bg-gray-800 shrink-0"
        :style="`background: conic-gradient(#3b82f6 ${summary.winRate}%, #ef4444 ${summary.winRate}% 100%);`"
      >
        <div
          class="absolute w-12 h-12 bg-[#1e1e24] rounded-full flex items-center justify-center"
        >
          <span
            class="text-sm font-black"
            :class="summary.winRate >= 50 ? 'text-blue-400' : 'text-red-400'"
          >
            {{ summary.winRate }}%
          </span>
        </div>
      </div>
      <div class="flex flex-col">
        <p
          class="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1"
        >
          {{ summary.totalGames }} Partidas
        </p>
        <p class="text-sm font-medium">
          <span class="text-blue-400">{{ summary.wins }}V</span> -
          <span class="text-red-400">{{ summary.losses }}D</span>
        </p>
      </div>
    </div>

    <div class="w-full h-px md:w-px md:h-12 bg-riot-border"></div>

    <div
      class="flex flex-col items-center md:items-start w-full md:w-auto shrink-0"
    >
      <p class="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">
        KDA Promedio
      </p>
      <p class="text-lg font-black tracking-wide text-gray-200">
        {{ summary.avgKills }}
        <span class="text-gray-500 font-normal text-sm">/</span>
        <span class="text-red-400">{{ summary.avgDeaths }}</span>
        <span class="text-gray-500 font-normal text-sm">/</span>
        {{ summary.avgAssists }}
      </p>
      <p
        class="text-xs mt-1 font-bold"
        :class="summary.kdaRatio >= 3 ? 'text-green-400' : 'text-gray-300'"
      >
        {{ summary.kdaRatio }}:1
        <span class="text-gray-500 font-normal">KDA</span>
      </p>
    </div>

    <div class="w-full h-px md:w-px md:h-12 bg-riot-border"></div>

    <div class="flex flex-col w-full md:w-auto flex-1">
      <p
        class="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2 text-center md:text-left"
      >
        Campeones Mas Jugados
      </p>
      <div class="flex flex-col gap-2">
        <div
          v-for="champ in championsPlayed"
          :key="champ.name"
          class="flex items-center gap-3"
        >
          <img
            :src="getChampionIconUrl(champ.name)"
            class="w-7 h-7 rounded-full border border-gray-600"
          />

          <div class="flex-1 flex justify-between items-center text-xs">
            <div class="flex flex-col">
              <span
                class="font-bold"
                :class="
                  champ.winRate >= 60
                    ? 'text-red-400'
                    : champ.winRate >= 50
                      ? 'text-blue-400'
                      : 'text-gray-400'
                "
              >
                {{ champ.winRate }}%
              </span>
              <span class="text-[10px] text-gray-500"
                >({{ champ.wins }}V {{ champ.losses }}D)</span
              >
            </div>

            <div class="flex flex-col items-end">
              <span
                class="font-medium text-gray-300"
                :class="champ.kda >= 3 ? 'text-green-400' : ''"
              >
                {{ champ.kda }} KDA
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
