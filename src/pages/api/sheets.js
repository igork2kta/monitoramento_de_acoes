const SHEET_URL = `https://docs.google.com/spreadsheets/d/e/2PACX-1vS1L19z4hUL112q8ofWtGAbbyVKAqk61VVDYXg1QUDs4vwx-Fac-p3VRVAeIAwTc3UnAFk_O1SSjpCV/pub?gid=0&single=true&output=csv`;

export default async function handler(req, res) {
  try {
    const response = await fetch(SHEET_URL);
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar a planilha: ${response.status} ${response.statusText}`);
    }

    const text = await response.text();
    
    // Separar linhas e remover aspas indesejadas
    const rows = text
      .trim()
      .split("\n")
      .map(row => row.replace(/"/g, "").split(",")); // Remove aspas e separa colunas

    if (rows.length < 2) {
      throw new Error("Planilha vazia ou com estrutura incorreta");
    }

    // Transformar em objetos { simbolo, desejado }
    const symbols = rows.slice(1) // Remove cabeçalho
      .map(row => ({
        simbolo: row[0]?.trim(), // Primeira coluna: código da ação
        desejado: parseFloat(row[1]?.trim()) || null // Segunda coluna: valor desejado
      }))
      .filter(item => item.simbolo); // Remove linhas vazias

    res.status(200).json({ symbols });
  } catch (error) {
    console.error("Erro ao acessar Google Sheets:", error);
    res.status(500).json({ error: "Erro ao acessar Google Sheets" });
  }
}
