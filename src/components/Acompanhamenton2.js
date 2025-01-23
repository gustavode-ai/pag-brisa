import React from "react";

// Componente funcional AcompanhamentoN2
const AcompanhamentoN2 = () => {
  return (
    <div
      style={{
        width: "1500px", // Define a largura do contêiner como 1500px
        height: "130vh", // Define a altura do contêiner como 130% da altura da janela
        marginTop: "1px", // Adiciona um pequeno espaçamento no topo
      }}
    >
      {/* Elemento iframe para embutir um relatório do Looker Studio */}
      <iframe
        src="https://lookerstudio.google.com/embed/reporting/70a20936-9f2c-47c7-bc0f-d16825996094/page/A" // URL do relatório do Looker Studio
        width="100%" // Define a largura do iframe como 100% do contêiner pai
        height="100%" // Define a altura do iframe como 100% do contêiner pai
        allowFullScreen // Permite que o iframe seja visualizado em tela cheia
        style={{ border: "none" }} // Remove qualquer borda adicional ao redor do iframe
        loading="lazy" // Carrega o conteúdo de forma assíncrona (lazy loading) para melhorar a performance
      ></iframe>
    </div>
  );
};

export default AcompanhamentoN2; // Exporta o componente para ser utilizado em outros arquivos
