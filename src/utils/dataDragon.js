import { ref } from "vue";

export const DD_VERSION = ref("14.8.1");

export const fetchLatestPatch = async () => {
  try {
    const res = await fetch(
      "https://ddragon.leagueoflegends.com/api/versions.json",
    );
    const versions = await res.json();
    DD_VERSION.value = versions[0];
    console.log("🐉 Data Dragon actualizado a la versión:", DD_VERSION.value);
  } catch (error) {
    console.error(
      "Error al obtener la versión de Riot, usando default.",
      error,
    );
  }
};

export const getChampionIconUrl = (championName) => {
  if (!championName) return "";
  const fixedName =
    championName === "FiddleSticks" ? "Fiddlesticks" : championName;
  return `https://ddragon.leagueoflegends.com/cdn/${DD_VERSION.value}/img/champion/${fixedName}.png`;
};

export const getItemIconUrl = (itemId) => {
  if (!itemId || itemId === 0) return "";
  return `https://ddragon.leagueoflegends.com/cdn/${DD_VERSION.value}/img/item/${itemId}.png`;
};

export const getProfileIconUrl = (iconId) => {
  if (iconId === undefined || iconId === null) return "";
  return `https://ddragon.leagueoflegends.com/cdn/${DD_VERSION.value}/img/profileicon/${iconId}.png`;
};

export const getSummonerSpellIconUrl = (spellName) => {
  if (!spellName || spellName === "SummonerEmpty") return "";
  return `https://ddragon.leagueoflegends.com/cdn/${DD_VERSION.value}/img/spell/${spellName}.png`;
};

export const getSummonerSpellMap = async () => {
  const res = await fetch(
    `https://ddragon.leagueoflegends.com/cdn/${DD_VERSION.value}/data/es_MX/summoner.json`,
  );
  const json = await res.json();

  const spellMap = {};
  Object.values(json.data).forEach((spell) => {
    spellMap[spell.key] = spell.id;
  });

  return spellMap;
};

export const getChampionMap = async () => {
  const res = await fetch(
    `https://ddragon.leagueoflegends.com/cdn/${DD_VERSION.value}/data/es_MX/champion.json`,
  );
  const json = await res.json();

  const champMap = {};
  Object.values(json.data).forEach((champ) => {
    champMap[champ.key] = champ.id;
  });

  return champMap;
};
