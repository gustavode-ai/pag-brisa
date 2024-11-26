import React, { useState } from "react";
import axios from "axios";
import { saveAs } from "file-saver";
import "./QueryForm.css";
import Papa from "papaparse";

const QueryForm = () => {
  const [formData, setFormData] = useState({
    tipoDado: "cdrs_sms",
    tipoNumero: "numeroOrigem",
    numero: "",
    dataInicio: "",
    dataFim: "",
    tabela: "simples", // Estado para alternar entre simples e completa
  });

  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError("");
  };

  const validateForm = () => {
    const { tipoDado, numero, dataInicio, dataFim } = formData;

    if (!numero || !dataInicio || !dataFim) {
      return "Todos os campos são obrigatórios.";
    }

    if (tipoDado === "cdrs_sms" && numero.length !== 13) {
      return "O número para SMS deve conter exatamente 13 caracteres.";
    }

    if (tipoDado === "cdrs_chamadas" && numero.length !== 11) {
      return "O número para Chamadas deve conter exatamente 11 caracteres.";
    }

    if (new Date(dataFim) <= new Date(dataInicio)) {
      return "A data final deve ser maior que a data inicial.";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("http://127.0.0.1:3000/query", formData);
      if (response.data.success) {
        setResult(response.data.data);
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      setError("Erro ao conectar ao servidor.");
    }
    setLoading(false);
  };

  const exportToCSV = (data) => {
    
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 19).replace("T", "_").replace(/:/g, "-"); 
    const csv = Papa.unparse(data)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, "resultado_" + dateStr + ".csv");
  };

  const handleClear = () => {
    setFormData({
      tipoDado: "cdrs_sms",
      tipoNumero: "numeroOrigem",
      numero: "",
      dataInicio: "",
      dataFim: "",
      tabela: "simples", // Reseta a opção de tabela
    });
    setError("");
    setResult(null);
  };

  
  let colunasExibidas = [];
  if (formData.tipoDado === "cdrs_sms") {
    colunasExibidas = formData.tabela === "simples"
      ? ["horarioRegistro", "operadoraDeOrigem", "numeroOrigem", "numeroDestino", "tipoDeDestino", "operadoraDeDestino", "resultadoDoEnvio"]
      : ["opr", "id", "sequencialCdr", "horarioRegistro", "horarioRecepcao", "horarioProcessamento", "tipoDeOrigem", "operadoraDeOrigem", "hostDeOrigemForm", "tipoNumeroOrigem", "planoNumeracaoOrigem", "numeroOrigem", "numeroDestino", "tipoDeDestino", "hostDeDestinoForm", "operadoraDeDestino", "resultadoDoEnvio", "indicadorDeRetentativa", "nomeArquivo"];
  } else if (formData.tipoDado === "cdrs_chamadas") {
    colunasExibidas = formData.tabela === "simples"
      ? ["dataChamada", "numeroOrigem", "numeroDestino"]
      : ["id", "dataChamada", "dataImportacao", "duracaoChamada", "duracaoSegundos", "numeroOrigem", "numeroDestino", "numeroDestinoDiscado", "statusChamada", "formatoEntrega", "numeroTratadoVss", "classificacao", "origem", "destino", "cic", "rel", "operadoraItx", "rotaChamada", "operadoraNumero", "rotaVsi", "modalidade", "sentidoChamada", "eotOrigem", "eotDestino", "nomeArquivo"];
  }

  
  const filteredResult = result
    ? result.map((row) => {
        const filteredRow = {};
        colunasExibidas.forEach((col) => {
          if (row[col]) {
            filteredRow[col] = row[col];
          }
        });
        return filteredRow;
      })
    : [];

  return (
    <div>
      <h1>
        <center>Consulta de CDR</center>
      </h1>
      <form onSubmit={handleSubmit}>
        <label>
          Tipo de Dados:
          <select name="tipoDado" value={formData.tipoDado} onChange={handleChange}>
            <option value="cdrs_sms">SMS</option>
            <option value="cdrs_chamadas">Chamadas</option>
          </select>
        </label>

        <label>
          Pesquisar por:
          <select name="tipoNumero" value={formData.tipoNumero} onChange={handleChange}>
            <option value="numeroOrigem">Número de Origem</option>
            <option value="numeroDestino">Número de Destino</option>
          </select>
        </label>

        <label>
          Número do Cliente:
          <input
            type="text" name="numero" value={formData.numero} onChange={handleChange} placeholder="Digite o número"required/>
        </label>

        <label>
          Data de Início:
          <input
            type="datetime-local" name="dataInicio" value={formData.dataInicio} onChange={handleChange} required/>
        </label>
        <label>
          Data de Fim:
          <input
            type="datetime-local" name="dataFim" value={formData.dataFim} onChange={handleChange} required/>
        </label>

        <div style={{ display: "flex", gap: "20px", margin: "10px 0" }}>
          <div>
            <input
              type="radio" id="simples" name="tabela" value="simples" checked={formData.tabela === "simples"} onChange={handleChange}/>
            <label htmlFor="simples">Tabela Simples</label>
          </div>
          <div>
            <input
              type="radio" id="completa" name="tabela" value="completa" checked={formData.tabela === "completa"} onChange={handleChange} />
              
            <label htmlFor="completa">Tabela Completa</label>
          </div>
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Buscando..." : "Buscar"}
        </button>

        <div className="buttons-container">
          <button className="b" type="button" onClick={() => exportToCSV(filteredResult)} disabled={!filteredResult.length}>
            Baixar CSV
          </button>
          <button className="b" type="button" onClick={handleClear}>
            Limpar
          </button>
        </div>
      </form>

      {filteredResult && filteredResult.length > 0 ? (
        <div>
          <h2>Resultado</h2>
          
          <table>
            <thead>
              <tr>
                {Object.keys(filteredResult[0]).map((key) => (
                  <th key={key}>{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredResult.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((value, idx) => (
                    <td key={idx}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : result && result.length === 0 ? (
        <center><p className="s">Nenhum resultado encontrado.</p></center>
      ) : null}
    </div>
  );
};

export default QueryForm;
