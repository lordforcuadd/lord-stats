export default async function handler(req, res) {
  const { region, endpoint } = req.query;

  const API_KEY = process.env.RIOT_API_KEY;

  if (!region || !endpoint) {
    return res.status(400).json({ error: "Faltan parámetros" });
  }

  const url = `https://${region}.api.riotgames.com${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: {
        "RGAPI-6ac92e5b-9c70-4159-94f7-f743dedb88a5": API_KEY,
      },
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error("Error en el Proxy:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
