import { useEffect, useState } from "react";

export default function Home() {
  const [cotacoes, setCotacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCotacoes = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/cotacoes");
      const data = await res.json();

      if (data.cotacoes) {
        setCotacoes(data.cotacoes);
      }
    } catch (error) {
      console.error("Erro ao buscar cotações:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCotacoes(); // Buscar ao carregar a página

    // Atualizar a cada 5 minutos (300000 ms)
    const interval = setInterval(fetchCotacoes, 300000);
    
    return () => clearInterval(interval); // Limpa o intervalo ao desmontar
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Cotações de Ações</h1>
      {loading && <p>Carregando...</p>}

      {!loading && cotacoes.length === 0 && <p>Nenhuma cotação encontrada.</p>}

      {!loading && cotacoes.length > 0 && (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Símbolo</th>
              <th>Desejado</th>
              <th>Atual</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {cotacoes.map(({ simbolo, desejado, atual }) => (
              <tr key={simbolo}>
                <td>{simbolo}</td>
                <td>R$ {desejado?.toFixed(2) || "-"}</td>
                <td>R$ {atual?.toFixed(2) || "-"}</td>
                <td style={{ color: atual >= desejado ? "red" : "green" }}>
                  {atual >= desejado ? "Acima do desejado ❌": "Alvo atingido ✅"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
