import React from "react";

// Componente funcional AcompanhamentoN2admin
const AcompanhamentoN2admin = () => {
  return (
    <div
      style={{
        width: "100%", // Define a largura do contêiner como 100% da largura da tela
        height: "130vh", // Define a altura do contêiner como 130% da altura da janela de visualização
        marginTop: "1px", // Adiciona um pequeno espaçamento no topo do contêiner
      }}
    >
      {/* Elemento iframe para embutir um relatório do Looker Studio */}
      <iframe
        src="https://lookerstudio.google.com/embed/reporting/70a20936-9f2c-47c7-bc0f-d16825996094/page/A" // URL do relatório do Looker Studio
        width="100%" // Define a largura do iframe como 100% do contêiner pai
        height="100%" // Define a altura do iframe como 100% do contêiner pai
        frameBorder="0" // Remove a borda ao redor do iframe
        allowFullScreen // Permite que o iframe seja visualizado em tela cheia
        style={{ border: "none" }} // Remove qualquer borda adicional ao redor do iframe
      ></iframe>
    </div>
  );
};

export default AcompanhamentoN2admin; // Exporta o componente para ser utilizado em outros arquivos
