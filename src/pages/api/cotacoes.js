const TOKEN = "vJ5HZPyx4NZWDojUpXM3uy";

const BASE_URL = "https://brapi.dev/api/quote";
export default async function handler(req, res) {
  try {
    // Buscar a lista de ações e valores desejados na planilha
    const sheetRes = await fetch(`http://${req.headers.host}/api/sheets`);
    const { symbols } = await sheetRes.json();

    // Para cada ação, buscar a cotação na brapi
    const cotacoes = await Promise.all(symbols.map(async ({ simbolo, desejado }) => {
      const response = await fetch(`${BASE_URL}/${simbolo}?token=${TOKEN}`);
      const data = await response.json();

      return {
        simbolo,
        desejado,
        atual: data?.results?.[0]?.regularMarketPrice || null
      };
    }));

    res.status(200).json({ cotacoes });
  } catch (error) {
    console.error("Erro ao buscar cotações:", error);
    res.status(500).json({ error: "Erro ao buscar cotações" });
  }
}