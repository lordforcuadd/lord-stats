<template>
  <div
    class="flex flex-col md:flex-row items-center md:items-start gap-6 p-6 md:p-8 bg-gradient-to-r from-[#1e1e24] to-[#0a0a0c] rounded-2xl mb-6 border border-gray-700/50 relative overflow-hidden"
  >
    <div
      class="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[80px] pointer-events-none"
    ></div>

    <div class="relative shrink-0">
      <img
        v-if="accountData?.profileIconId !== undefined"
        :src="getProfileIconUrl(accountData.profileIconId)"
        alt="Icono de Perfil"
        class="w-28 h-28 md:w-32 md:h-32 rounded-3xl border-2 border-gray-600 object-cover shadow-2xl shadow-black/50"
      />
      <span
        class="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#0a0a0c] text-white text-xs font-black px-4 py-1 rounded-full border border-gray-600"
      >
        {{ accountData?.summonerLevel }}
      </span>
    </div>

    <div class="flex flex-col items-center md:items-start flex-1 z-10">
      <div class="flex flex-wrap gap-2 mb-3">
        <span
          class="bg-[#2a2a32] text-gray-400 border border-gray-700 text-[10px] font-bold px-2 py-1 rounded"
          >S2023 <b class="text-gray-300">Plata</b></span
        >
        <span
          class="bg-[#2a2a32] text-gray-400 border border-gray-700 text-[10px] font-bold px-2 py-1 rounded"
          >S2022 <b class="text-yellow-500">Oro</b></span
        >
        <span
          class="bg-[#2a2a32] text-gray-400 border border-gray-700 text-[10px] font-bold px-2 py-1 rounded"
          >S2021 <b class="text-gray-300">Plata</b></span
        >
      </div>

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
          class="text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-1.5 rounded-md transition-colors shadow-lg shadow-blue-600/20"
        >
          Actualizar Datos
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { getProfileIconUrl } from "../../utils/dataDragon";

defineProps({
  accountData: { type: Object, required: true },
  region: { type: String, required: true },
});
</script>
