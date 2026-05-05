import { defineStore } from "pinia";
import { getContinent } from "../utils/regions";
import { getChampionMap, getSummonerSpellMap } from "../utils/dataDragon";

export const useSummonerStore = defineStore("summoner", {
  state: () => ({
    accountData: null,
    leagueData: [],
    matches: [],
    masteries: [],
    realRegion: "",
    isLoading: false,
    error: null,
  }),

  actions: {
    async fetchSummoner(selectedRegion, gameName, tagLine) {
      this.isLoading = true;
      this.error = null;
      this.accountData = null;
      this.leagueData = [];
      this.matches = [];
      this.masteries = [];
      this.realRegion = selectedRegion.toLowerCase();

      try {
        const continent = getContinent(this.realRegion);

        const accountEndpoint = `/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
        const accountRes = await fetch(
          `/api/riot?region=${continent}&endpoint=${encodeURIComponent(accountEndpoint)}`,
        );

        if (!accountRes.ok)
          throw new Error(
            `No se encontró a ${gameName}#${tagLine} en ${continent.toUpperCase()}.`,
          );

        const rawAccount = await accountRes.json();
        const puuid = rawAccount.puuid;

        const profileEndpoint = `/lol/summoner/v4/summoners/by-puuid/${puuid}`;
        const profileRes = await fetch(
          `/api/riot?region=${this.realRegion}&endpoint=${encodeURIComponent(profileEndpoint)}`,
        );

        if (!profileRes.ok)
          throw new Error("La cuenta existe pero no tiene un perfil activo.");

        const profileData = await profileRes.json();

        console.log("Datos del Perfil (EUW/LAN):", {
          id: profileData.id,
          icono: profileData.profileIconId,
        });

        this.accountData = {
          gameName: rawAccount.gameName,
          tagLine: rawAccount.tagLine,
          puuid: puuid,
          id: profileData.id || null,
          profileIconId: profileData.profileIconId,
          summonerLevel: profileData.summonerLevel,
        };

        const leagueEndpoint = `/lol/league/v4/entries/by-puuid/${puuid}`;
        const leagueRes = await fetch(
          `/api/riot?region=${this.realRegion}&endpoint=${encodeURIComponent(leagueEndpoint)}`,
        );

        if (leagueRes.ok) {
          this.leagueData = await leagueRes.json();
          console.log("🏆 Ligas obtenidas correctamente");
        } else {
          console.warn(
            "No se pudieron obtener las ligas (Puede ser Unranked).",
          );
          this.leagueData = [];
        }

        const masteryEndpoint = `/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}/top?count=3`;
        const masteryRes = await fetch(
          `/api/riot?region=${this.realRegion}&endpoint=${encodeURIComponent(masteryEndpoint)}`,
        );

        if (masteryRes.ok) {
          const rawMasteries = await masteryRes.json();
          const champMap = await getChampionMap();
          this.masteries = rawMasteries.map((m) => ({
            championId: m.championId,
            championLevel: m.championLevel,
            championPoints: m.championPoints,
            championName: champMap[m.championId] || "Unknown",
          }));
        }

        const matchIdsEndpoint = `/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=10`;
        const matchIdsRes = await fetch(
          `/api/riot?region=${continent}&endpoint=${encodeURIComponent(matchIdsEndpoint)}`,
        );

        if (matchIdsRes.ok) {
          const matchIds = await matchIdsRes.json();

          const matchPromises = matchIds.map((id) => {
            const matchEndpoint = `/lol/match/v5/matches/${id}`;
            return fetch(
              `/api/riot?region=${continent}&endpoint=${encodeURIComponent(matchEndpoint)}`,
            ).then((res) => res.json());
          });

          const matchesData = await Promise.all(matchPromises);
          const champMap = await getChampionMap();
          const spellMap = await getSummonerSpellMap();

          this.matches = matchesData.map((match) => {
            const participant = match.info.participants.find(
              (p) => p.puuid === puuid,
            );

            const allPlayers = match.info.participants.map((p) => ({
              ...p,
              isMe: p.puuid === puuid,
              spell1Name: spellMap[p.summoner1Id] || "SummonerEmpty",
              spell2Name: spellMap[p.summoner2Id] || "SummonerEmpty",
            }));

            return {
              id: match.metadata.matchId,
              queueId: match.info.queueId,
              gameMode: match.info.gameMode,
              duration: match.info.gameDuration,
              gameCreation: match.info.gameCreation,
              player: {
                ...participant,
                spell1Name:
                  spellMap[participant.summoner1Id] || "SummonerEmpty",
                spell2Name:
                  spellMap[participant.summoner2Id] || "SummonerEmpty",
              },
              participants: allPlayers,
            };
          });
        }
      } catch (err) {
        console.error("Error en el store:", err);
        this.error = err.message;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
