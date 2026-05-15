import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const analyzeMatch = async (playerStats) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const timelineContext =
      playerStats.earlyGame && playerStats.earlyGame !== "No disponible"
        ? `- Minuto 10: ${playerStats.earlyGame.oro_min10 || 0} Oro. Monstruos de Jungla: ${playerStats.earlyGame.jg_min10 || 0}.
         - Minuto 15: ${playerStats.earlyGame.oro_min15 || 0} Oro. Monstruos de Jungla: ${playerStats.earlyGame.jg_min15 || 0}.`
        : "No hay datos de línea de tiempo (Partida muy corta o modo sin registro de minutos).";

    const prompt = `
      Eres un Coach de League of Legends rango Challenger. Tu personalidad es estricta, cruda, sarcástica y sin filtros.
      Hablas usando jerga de la comunidad ("carrear", "fedear", "gap", "inting", "stompear", "tilteo", "jg diff", "losers queue").
      Analiza estas estadísticas y devuelve un puntaje del 0 al 100 y un comentario de máximo 2 oraciones.

      REGLAS DE PERSONALIDAD (IMPORTANTE):
      1. Si tiene más muertes que asesinatos+asistencias: Destrózalo verbalmente. Dile que deje de "fedear" o que está jugando con el monitor apagado.
      2. Si ganó pero con un KDA horrible: Déjale clarísimo que su equipo lo "carreó" y que fue un peso muerto.
      3. Si perdió pero tiene stats de dios (mucho daño, pocas muertes): Compadécete de él, dile que fue "team gap" o que no se merece ese emparejamiento.
      4. Si jugó excelente y ganó: Felicítalo, pero con tono de coach exigente ("Nada mal, pero no te relajes").
      5. Sé entretenido y punzante.

      REGLAS ESTRICTAS POR MODO DE JUEGO (${playerStats.gameMode}):
      - Si es "Ranked Solo/Dúo" o "Ranked Flex": Sé implacable. El Farm (CS/min), el KDA y el oro son sagrados. Castígalo si su fase de líneas (Línea de Tiempo) fue pobre.
      - Si es "Clash" o "Torneo": Entorno competitivo. Búrlate si hizo perder a sus amigos, elógialo si carreó el torneo.
      - Si es "ARAM", "Arena", "URF" o "Modos Rotativos": EL FARMEO (CS) ES COMPLETAMENTE IRRELEVANTE. Basa tu crítica 100% en el daño a campeones, combos y KDA. Prohibido mencionar súbditos aquí.
      - Si es "Normal", "Quickplay" o "Personalizada": Es un modo casual. Si sus stats son malos, dile que "menos mal que era normal", pero sácale en cara sus errores básicos.

      ESTADÍSTICAS DEL JUGADOR:
      - Campeón: ${playerStats.championName || playerStats.campeon}
      - Rol: ${playerStats.teamPosition || playerStats.rol || "Sin rol definido"}
      - Modo de juego: ${playerStats.gameMode || playerStats.gameModeName}
      - Resultado de la partida: ${playerStats.win || playerStats.resultado === "Victoria" ? "Victoria" : "Derrota"}
      - KDA (Kills/Deaths/Assists): ${playerStats.kills}/${playerStats.deaths}/${playerStats.assists}
      - Daño total a campeones: ${playerStats.totalDamageDealtToChampions || playerStats.daño}
      - Farm (CS) Total: ${playerStats.totalCS || playerStats.csLinea} (${playerStats.csPerMin || 0} CS/min)

      LÍNEA DE TIEMPO (Early Game / Fase de Líneas):
      ${timelineContext}
      *(Nota para el Coach: Si el rol es "JUNGLE", fíjate mucho en sus Monstruos de Jungla al minuto 10/15. Si es otro rol, enfócate en su ventaja de Oro).*

      Responde SOLO con esta estructura JSON exacta, sin añadir markdown ni comillas invertidas extra:
      {
        "score": "Tu puntuacion del 1 al 100 en base a su rendimiento general en la partida aqui",
        "comment": "Tu comentario sarcástico aquí."
      }
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error("Error Gemini:", error);
    return {
      score: 0,
      comment:
        "El coach está tilt y rompió el teclado intentando leer esta partida. Intenta de nuevo.",
    };
  }
};
