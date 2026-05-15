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
    isLoadingMore: false,
    error: null,
    matchIdsList: [],
    currentMatchIndex: 0,
    clashData: [],
    liveGame: null,
  }),

  actions: {
    async fetchSummoner(selectedRegion, gameName, tagLine, isUpdate = false) {
      if (!isUpdate) this.isLoading = true;
      this.error = null;
      this.accountData = null;
      this.leagueData = [];
      this.matches = [];
      this.masteries = [];
      this.clashData = [];
      this.liveGame = null;
      this.realRegion = selectedRegion.toLowerCase();

      try {
        const continent = getContinent(this.realRegion);

        const accountRes = await fetch(
          `/api-${continent}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
        );
        if (!accountRes.ok)
          throw new Error(`No se encontró a ${gameName}#${tagLine}.`);

        const rawAccount = await accountRes.json();
        const puuid = rawAccount.puuid;

        const profileRes = await fetch(
          `/api-${this.realRegion}/lol/summoner/v4/summoners/by-puuid/${puuid}`,
        );
        if (!profileRes.ok)
          throw new Error("La cuenta existe pero no tiene un perfil activo.");

        const profileData = await profileRes.json();
        const summonerId = profileData.id;

        const [scoreRes, challRes, leagueRes, masteryRes, clashRes] =
          await Promise.all([
            fetch(
              `/api-${this.realRegion}/lol/champion-mastery/v4/scores/by-puuid/${puuid}`,
            ),
            fetch(
              `/api-${this.realRegion}/lol/challenges/v1/player-data/${puuid}`,
            ),

            fetch(
              `/api-${this.realRegion}/lol/league/v4/entries/by-puuid/${puuid}`,
            ),

            fetch(
              `/api-${this.realRegion}/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}/top?count=3`,
            ),
            fetch(
              `/api-${this.realRegion}/lol/clash/v1/players/by-puuid/${puuid}`,
            ),
          ]);

        let totalMasteryScore = 0;
        let challengeCrystal = "UNRANKED";

        if (scoreRes.ok) totalMasteryScore = await scoreRes.json();
        if (challRes.ok) {
          const challData = await challRes.json();
          challengeCrystal =
            challData?.category?.CHALLENGE?.level || "UNRANKED";
        }

        this.accountData = {
          gameName: rawAccount.gameName,
          tagLine: rawAccount.tagLine,
          puuid: puuid,
          id: summonerId,
          profileIconId: profileData.profileIconId,
          summonerLevel: profileData.summonerLevel,
          totalMasteryScore: totalMasteryScore,
          challengeCrystal: challengeCrystal,
        };

        if (leagueRes.ok) this.leagueData = await leagueRes.json();

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

        if (clashRes.ok) this.clashData = await clashRes.json();

        const baseUrl = `/api-${continent}/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0`;
        const [stdRes, tourneyRes, arenaRes, caosRes] = await Promise.all([
          fetch(`${baseUrl}&count=40`),
          fetch(`${baseUrl}&type=tourney&count=15`),
          fetch(`${baseUrl}&queue=1710&count=15`),
          fetch(`${baseUrl}&queue=720&count=15`),
        ]);

        let combinedIds = [];
        if (stdRes.ok) combinedIds.push(...(await stdRes.json()));
        if (tourneyRes.ok) combinedIds.push(...(await tourneyRes.json()));
        if (arenaRes.ok) combinedIds.push(...(await arenaRes.json()));
        if (caosRes.ok) combinedIds.push(...(await caosRes.json()));

        let uniqueIds = [...new Set(combinedIds)];
        uniqueIds.sort((a, b) => {
          const idA = parseInt(a.split("_")[1] || 0);
          const idB = parseInt(b.split("_")[1] || 0);
          return idB - idA;
        });

        this.matchIdsList = uniqueIds;
        this.currentMatchIndex = 0;

        await this.loadMoreMatches();
        await this.fetchLiveGame();
      } catch (err) {
        console.error("Error en el store:", err);
        this.error = err.message;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchLiveGame() {
      if (!this.accountData?.puuid) return;
      try {
        const res = await fetch(
          `/api-${this.realRegion}/lol/spectator/v5/active-games/by-summoner/${this.accountData.puuid}`,
        );
        if (res.ok) {
          this.liveGame = await res.json();
        } else {
          this.liveGame = null;
        }
      } catch (e) {
        this.liveGame = null;
      }
    },

    async loadMoreMatches() {
      if (
        this.isLoadingMore ||
        this.currentMatchIndex >= this.matchIdsList.length
      )
        return;

      this.isLoadingMore = true;
      try {
        const continent = getContinent(this.realRegion);
        const nextIds = this.matchIdsList.slice(
          this.currentMatchIndex,
          this.currentMatchIndex + 10,
        );

        // Filtro para ignorar si Riot nos da una partida rota (ej: 404)
        const matchPromises = nextIds.map((id) =>
          fetch(`/api-${continent}/lol/match/v5/matches/${id}`)
            .then((res) => (res.ok ? res.json() : null))
            .catch(() => null),
        );

        const matchesData = await Promise.all(matchPromises);
        const champMap = await getChampionMap();
        const spellMap = await getSummonerSpellMap();

        const formattedMatches = matchesData
          .filter((m) => m && m.info && m.info.participants)
          .map((match) => {
            const participant = match.info.participants.find(
              (p) => p.puuid === this.accountData.puuid,
            );
            if (!participant) return null;

            const totalCS =
              (participant.totalMinionsKilled || 0) +
              (participant.neutralMinionsKilled || 0);

            const allPlayers = match.info.participants.map((p) => ({
              ...p,
              isMe: p.puuid === this.accountData.puuid,
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
                totalCS: totalCS,
                spell1Name:
                  spellMap[participant.summoner1Id] || "SummonerEmpty",
                spell2Name:
                  spellMap[participant.summoner2Id] || "SummonerEmpty",
              },
              participants: allPlayers,
            };
          })
          .filter((m) => m !== null);

        this.matches = [...this.matches, ...formattedMatches];
        this.currentMatchIndex += 10;
      } catch (error) {
        console.error("Error cargando más partidas:", error);
      } finally {
        this.isLoadingMore = false;
      }
    },
  },
});
