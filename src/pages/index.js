import { useEffect, useState } from "react";

export default function Home() {
  const [cotacoes, setCotacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);
  const [jaTocou, setJaTocou] = useState({});
  const [usuarioInteragiu, setUsuarioInteragiu] = useState(false);
  const [notificacoesAtivadas, setNotificacoesAtivadas] = useState(false);

  const fetchCotacoes = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/cotacoes");
      const data = await res.json();

      if (data.cotacoes) {
        setCotacoes(data.cotacoes);
        setUltimaAtualizacao(new Date().toLocaleString());

        data.cotacoes.forEach(({ simbolo, desejado, atual }) => {
          if (atual >= desejado && !jaTocou[simbolo] && usuarioInteragiu) {
            tocarAlerta();
            enviarNotificacao(simbolo, atual);
            setJaTocou((prev) => ({ ...prev, [simbolo]: true }));
          } else if (atual < desejado) {
            setJaTocou((prev) => ({ ...prev, [simbolo]: false }));
          }
        });
      }
    } catch (error) {
      console.error("Erro ao buscar cotações:", error);
    } finally {
      setLoading(false);
    }
  };

  const tocarAlerta = () => {
    const audio = new Audio("/alert.mp3");
    audio.play().catch((error) => console.error("Erro ao reproduzir o som:", error));
  };

  const enviarNotificacao = (simbolo, atual) => {
    if (notificacoesAtivadas && "Notification" in window && Notification.permission === "granted") {
      new Notification("Alerta de Cotação", {
        body: `A ação ${simbolo} atingiu R$ ${atual.toFixed(2)}!`,
        icon: "/icon.png",
      });
    }
  };

  const ativarNotificacoes = async () => {
    if (!("Notification" in window)) {
      alert("Seu navegador não suporta notificações.");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      setNotificacoesAtivadas(true);
      alert("Notificações ativadas!");
    } else {
      alert("Permissão negada para notificações.");
    }
  };

  useEffect(() => {
    fetchCotacoes();
    const interval = setInterval(fetchCotacoes, 300000);
    return () => clearInterval(interval);
  }, [usuarioInteragiu]);

  useEffect(() => {
    const handleUserInteraction = () => setUsuarioInteragiu(true);
    window.addEventListener("click", handleUserInteraction);
    window.addEventListener("keydown", handleUserInteraction);
    return () => {
      window.removeEventListener("click", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
    };
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Cotações de Ações</h1>

      <button 
        onClick={fetchCotacoes} 
        disabled={loading} 
        style={{ marginBottom: "10px", padding: "10px", cursor: loading ? "not-allowed" : "pointer" }}
      >
        {loading ? "Atualizando..." : "Atualizar Agora"}
      </button>

      <button 
        onClick={ativarNotificacoes} 
        disabled={notificacoesAtivadas} 
        style={{ marginLeft: "10px", padding: "10px", cursor: notificacoesAtivadas ? "not-allowed" : "pointer" }}
      >
        {notificacoesAtivadas ? "Notificações Ativadas" : "Ativar Notificações"}
      </button>

      {loading && <p>Carregando...</p>}

      {!loading && cotacoes.length === 0 && <p>Nenhuma cotação encontrada.</p>}

      {!loading && cotacoes.length > 0 && (
        <>
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
                    {atual >= desejado ? "Acima do esperado ❌" : "Alvo atingido ✅"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <p><strong>Última atualização:</strong> {ultimaAtualizacao}</p>
        </>
      )}
    </div>
  );
}
