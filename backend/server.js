const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./db"); 

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Rota inicial
app.get("/", (req, res) => {
  res.send("Servidor funcionando! Use o endpoint /query para consultas.");
});

// Endpoint para consultas
app.post("/query", (req, res) => {
  const { tipoDado, tipoNumero, numero, dataInicio, dataFim } = req.body;

  // Define a tabela e o campo com base no tipo de dado e tipo de número
  const tabela = tipoDado === "cdrs_sms" ? "cdrs_sms" : "cdrs_chamadas";
  const campoNumero = tipoNumero === "numeroOrigem" ? "numeroOrigem" : "numeroDestino";

  let query = "";
  if (tabela === "cdrs_sms") {
    query = `
      SELECT * 
      FROM ${tabela} 
      WHERE ${campoNumero} = ? 
      AND horarioRegistro BETWEEN ? AND ?`;
  } else if (tabela === "cdrs_chamadas") {
    query = `
      SELECT * 
      FROM ${tabela} 
      WHERE ${campoNumero} = ? 
      AND dataChamada BETWEEN ? AND ?`;
  }

  // Executa a consulta no banco de dados
  db.query(query, [numero, dataInicio, dataFim], (err, results) => {
    if (err) {
      console.error("Erro na consulta ao banco:", err.message);
      return res.status(500).json({ success: false, error: "Erro ao acessar o banco de dados." });
    }

    // Retorna os resultados em formato JSON
    res.json({ success: true, data: results });
  });
});

// Inicia o servidor
app.listen(PORT,'0.0.0.0', () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
