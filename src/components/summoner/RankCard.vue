<template>
  <div class="flex flex-col gap-4">
    <div
      class="bg-[#1c1c22] rounded-xl border border-gray-700/50 overflow-hidden shadow-lg"
    >
      <div class="p-3 border-b border-gray-700/50 bg-[#25252b]">
        <h3 class="text-xs font-bold text-gray-300">Ranked Solo</h3>
      </div>

      <div class="p-4">
        <div v-if="soloQ" class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-4">
            <img
              :src="`https://opgg-static.akamaized.net/images/medals_new/${soloQ.tier.toLowerCase()}.png`"
              class="w-16 h-16 drop-shadow-lg"
              @error="
                $event.target.src =
                  'https://opgg-static.akamaized.net/images/medals_new/unranked.png'
              "
            />
            <div>
              <p
                class="text-xl font-black capitalize"
                :class="tierColors[soloQ.tier] || 'text-white'"
              >
                {{ soloQ.tier.toLowerCase() }} {{ soloQ.rank }}
              </p>
              <p class="text-sm text-gray-400 font-medium">
                {{ soloQ.leaguePoints }} LP
              </p>
            </div>
          </div>

          <div class="text-right">
            <p class="text-xs text-gray-400 font-medium mb-1">
              {{ soloQ.wins }}W {{ soloQ.losses }}L
            </p>
            <p
              class="text-sm font-bold"
              :class="soloWinrate >= 50 ? 'text-blue-400' : 'text-red-400'"
            >
              Win Rate {{ soloWinrate }}%
            </p>
          </div>
        </div>
        <div v-else class="py-4 text-center text-gray-500 font-medium text-sm">
          Unranked en Solo/Duo
        </div>

        <div v-if="soloQ && timelineSteps" class="mb-8 px-2 relative mt-6">
          <div class="absolute top-[7px] left-4 right-4">
            <div class="absolute w-full h-1.5 bg-gray-700 rounded-full"></div>

            <div
              class="absolute h-1.5 bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
              :style="{ width: `${progressPercentage}%` }"
            ></div>

            <div
              class="absolute -top-3 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-transparent border-t-emerald-400 transition-all duration-1000 ease-out -translate-x-1/2"
              :style="{ left: `${progressPercentage}%` }"
            ></div>
          </div>

          <div class="flex justify-between relative z-10">
            <div
              v-for="(step, index) in timelineSteps"
              :key="index"
              class="flex flex-col items-center gap-1.5 group"
            >
              <div
                class="w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors bg-[#1c1c22]"
                :class="[
                  progressPercentage >= index * 25
                    ? 'border-emerald-500'
                    : 'border-gray-600',
                  step.isNextTier ? 'w-5 h-5 border-blue-400' : '',
                ]"
              >
                <svg
                  v-if="progressPercentage > index * 25"
                  xmlns="http://www.w3.org/2000/svg"
                  class="w-2.5 h-2.5 text-emerald-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>

              <span
                class="text-[10px] font-bold"
                :class="[
                  progressPercentage >= index * 25
                    ? 'text-emerald-500'
                    : 'text-gray-500',
                  step.isNextTier ? 'text-blue-400' : '',
                ]"
              >
                {{ step.label }}
              </span>
            </div>
          </div>
        </div>

        <div
          v-if="soloQ"
          class="bg-[#16161a] border border-gray-800 rounded-lg p-3"
        >
          <div class="flex justify-between items-center mb-2">
            <p class="text-[10px] text-gray-400">
              Últimos 30d
              <span class="text-red-400 font-bold ml-1">▼ -45 LP</span>
            </p>
            <p class="text-[10px] text-gray-500 font-mono">MOCK DATA</p>
          </div>
          <div class="w-full h-16 relative">
            <div class="absolute inset-0 border-b border-l border-gray-800">
              <div class="absolute w-full h-px bg-gray-800 top-1/2"></div>
              <div class="absolute w-px h-full bg-gray-800 left-1/3"></div>
              <div class="absolute w-px h-full bg-gray-800 left-2/3"></div>
            </div>
            <svg
              class="w-full h-full overflow-visible"
              preserveAspectRatio="none"
              viewBox="0 0 100 100"
            >
              <path
                d="M0,40 L15,40 L25,60 L35,50 L50,50 L55,70 L65,30 L70,55 L80,35 L90,80 L100,60"
                fill="none"
                stroke="#2dd4bf"
                stroke-width="2"
                vector-effect="non-scaling-stroke"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <div
      class="bg-[#1c1c22] rounded-xl border border-gray-700/50 overflow-hidden shadow-lg"
    >
      <div class="p-3 border-b border-gray-700/50 bg-[#25252b]">
        <h3 class="text-xs font-bold text-gray-300">Ranked Flex</h3>
      </div>

      <div class="p-4">
        <div v-if="flexQ" class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <img
              :src="`https://opgg-static.akamaized.net/images/medals_new/${flexQ.tier.toLowerCase()}.png`"
              class="w-12 h-12 drop-shadow-lg opacity-80"
              @error="
                $event.target.src =
                  'https://opgg-static.akamaized.net/images/medals_new/unranked.png'
              "
            />
            <div>
              <p
                class="text-base font-black capitalize"
                :class="tierColors[flexQ.tier] || 'text-white'"
              >
                {{ flexQ.tier.toLowerCase() }} {{ flexQ.rank }}
              </p>
              <p class="text-xs text-gray-400 font-medium">
                {{ flexQ.leaguePoints }} LP
              </p>
            </div>
          </div>

          <div class="text-right">
            <p class="text-[11px] text-gray-400 font-medium mb-1">
              {{ flexQ.wins }}W {{ flexQ.losses }}L
            </p>
            <p
              class="text-xs font-bold"
              :class="flexWinrate >= 50 ? 'text-blue-400' : 'text-red-400'"
            >
              Win Rate {{ flexWinrate }}%
            </p>
          </div>
        </div>
        <div v-else class="py-2 text-center text-gray-500 font-medium text-xs">
          Unranked en Flex
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  leagueData: { type: Array, default: () => [] },
});

const soloQ = computed(() =>
  props.leagueData.find((l) => l.queueType === "RANKED_SOLO_5x5"),
);
const flexQ = computed(() =>
  props.leagueData.find((l) => l.queueType === "RANKED_FLEX_SR"),
);

const calcWinrate = (queue) => {
  if (!queue) return 0;
  const total = queue.wins + queue.losses;
  return total === 0 ? 0 : Math.round((queue.wins / total) * 100);
};

const soloWinrate = computed(() => calcWinrate(soloQ.value));
const flexWinrate = computed(() => calcWinrate(flexQ.value));

const tierColors = {
  IRON: "text-gray-500",
  BRONZE: "text-amber-700",
  SILVER: "text-gray-300",
  GOLD: "text-yellow-400",
  PLATINUM: "text-teal-400",
  EMERALD: "text-emerald-500",
  DIAMOND: "text-blue-400",
  MASTER: "text-purple-400",
  GRANDMASTER: "text-red-500",
  CHALLENGER: "text-cyan-400",
};

const timelineSteps = computed(() => {
  if (!soloQ.value) return null;

  const currentTier = soloQ.value.tier;
  const currentRank = soloQ.value.rank;

  if (["MASTER", "GRANDMASTER", "CHALLENGER"].includes(currentTier))
    return null;

  const order = [
    "IRON",
    "BRONZE",
    "SILVER",
    "GOLD",
    "PLATINUM",
    "EMERALD",
    "DIAMOND",
    "MASTER",
    "GRANDMASTER",
    "CHALLENGER",
  ];
  const divOrder = ["IV", "III", "II", "I"];

  const tierIndex = order.indexOf(currentTier);
  const nextTier =
    tierIndex < order.length - 1 ? order[tierIndex + 1] : currentTier;
  const rankIndex = divOrder.indexOf(currentRank);

  const letter = currentTier.charAt(0);
  const nextLetter = nextTier.charAt(0);

  return [
    { label: `${letter}4`, passed: rankIndex > 0, current: rankIndex === 0 },
    { label: `${letter}3`, passed: rankIndex > 1, current: rankIndex === 1 },
    { label: `${letter}2`, passed: rankIndex > 2, current: rankIndex === 2 },
    { label: `${letter}1`, passed: rankIndex > 3, current: rankIndex === 3 },
    {
      label: `${nextLetter}4`,
      passed: false,
      current: false,
      isNextTier: true,
    },
  ];
});

const progressPercentage = computed(() => {
  if (!soloQ.value) return 0;

  const currentTier = (soloQ.value.tier || "").toUpperCase();
  const currentRank = (soloQ.value.rank || "").toUpperCase();
  const lp = soloQ.value.leaguePoints;

  if (["MASTER", "GRANDMASTER", "CHALLENGER"].includes(currentTier)) return 100;

  const divOrder = ["IV", "III", "II", "I"];
  const rankIndex = divOrder.indexOf(currentRank);

  if (rankIndex === -1) return 0;

  const basePercent = rankIndex * 25;

  const lpPercent = (Math.min(lp, 100) / 100) * 25;

  return basePercent + lpPercent;
});
</script>
