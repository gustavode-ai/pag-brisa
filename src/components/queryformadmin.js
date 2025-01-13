import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { saveAs } from "file-saver";
import "./QueryForm.css";
import { GiBroom } from "react-icons/gi";
import { BsDownload } from "react-icons/bs";
import { RiSearch2Line } from "react-icons/ri";
import Papa from "papaparse";
import { format } from "date-fns";

const Queryformadmin = () => {
  const [formData, setFormData] = useState({
    tipoDado: "cdrs_sms", tipoNumero: "numeroOrigem", numero: "",
    dataInicio: "",
    dataFim: "",
    tabela: "simples",
  });

  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchPerformed, setSearchPerformed] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn !== "true") {
      navigate("/");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (
      name === "numero" &&
      formData.tipoDado === "cdrs_sms" &&
      !value.startsWith("55")
    ) {
      setFormData({ ...formData, [name]: `55${value}` });
    } else {
      setFormData({ ...formData, [name]: value });
    }
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
    setSearchPerformed(true);
    try {
      const response = await axios.post(
        "http://localhost:3000/query",
        formData
      );
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

    const dateStr = now
      .toLocaleString("pt-BR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
      .replace(/[\s/:]/g, "-");

    const formattedData = data.map((row) => {
      const formattedRow = {};
      Object.keys(row).forEach((key) => {
        formattedRow[key] = row[key] || "-";
      });
      return formattedRow;
    });

    const csv = Papa.unparse(formattedData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, `resultado_${formData.numero}_${dateStr}.csv`);
  };

  const handleClear = () => {
    setFormData({
      tipoDado: "cdrs_sms",
      tipoNumero: "numeroOrigem",
      numero: "",
      dataInicio: "",
      dataFim: "",
      tabela: "simples",
    });
    setError("");
    setResult(null);
  };

  let colunasExibidas = [];
  if (formData.tipoDado === "cdrs_sms") {
    colunasExibidas =
      formData.tabela === "simples"
        ? [
          "horarioRegistro",
          "operadoraDeOrigem",
          "numeroOrigem",
          "numeroDestino",
          "tipoDeDestino",
          "operadoraDeDestino",
          "resultadoDoEnvio",
        ]
        : [
          "id",
          "sequencialCdr",
          "horarioRegistro",
          "horarioRecepcao",
          "horarioProcessamento",
          "tipoDeOrigem",
          "operadoraDeOrigem",
          "hostDeOrigemForm",
          "tipoNumeroOrigem",
          "planoNumeracaoOrigem",
          "numeroOrigem",
          "numeroDestino",
          "tipoDeDestino",
          "hostDeDestinoForm",
          "operadoraDeDestino",
          "resultadoDoEnvio",
          "indicadorDeRetentativa",
          "nomeArquivo",
        ];
  } else if (formData.tipoDado === "cdrs_chamadas") {
    colunasExibidas =
      formData.tabela === "simples"
        ? [
          "dataChamada",
          "duracaoChamada",
          "numeroOrigem",
          "numeroDestino",
          "statusChamada",
          "rel",
        ]
        : [
          "id",
          "dataChamada",
          "dataImportacao",
          "duracaoChamada",
          "duracaoSegundos",
          "numeroOrigem",
          "numeroDestino",
          "numeroDestinoDiscado",
          "statusChamada",
          "formatoEntrega",
          "numeroTratadoVss",
          "classificacao",
          "origem",
          "destino",
          "cic",
          "rel",
          "operadoraItx",
          "rotaChamada",
          "operadoraNumero",
          "rotaVsi",
          "modalidade",
          "sentidoChamada",
          "eotOrigem",
          "eotDestino",
          "nomeArquivo",
        ];
  }

  const filteredResult = result
    ? result.map((row) => {
      const filteredRow = {};
      colunasExibidas.forEach((col) => {
        if (row[col]) {
          filteredRow[col] = row[col];
        } else {
          filteredRow[col] = "    -   ";
        }
      });
      return filteredRow;
    })
    : [];

  const dataColumns = [
    "dataChamada",
    "dataImportacao",
    "duracaoChamada",
    "horarioRegistro",
    "horarioRecepcao",
    "horarioProcessamento",
  ];

  return (
    <div>
      <br></br>
      <br></br>

      <form className="form-form" onSubmit={handleSubmit}>
        <h1>Buscar CDR</h1>
        <label>
          Tipo de Dados:
          <select
            name="tipoDado"
            value={formData.tipoDado}
            onChange={handleChange}
            className="tipodado"
          >
            <option className="option" value="cdrs_sms">
              SMS
            </option>
            <option className="option" value="cdrs_chamadas">
              Chamadas
            </option>
          </select>
        </label>
        <div>
          <label>
            Pesquisar por:
            <select
              name="tipoNumero"
              value={formData.tipoNumero}
              onChange={handleChange}
              className="tipodado"
            >
              <option className="option" value="numeroOrigem">
                Número de Origem
              </option>
              <option className="option" value="numeroDestino">
                Número de Destino
              </option>
            </select>
          </label>
        </div>
        <label>
          Número do Cliente:
          <input
            type="text"
            name="numero"
            value={formData.numero}
            onChange={handleChange}
            placeholder="Digite o número"
            className="tipodado"
            required
          />
        </label>

        <label>
          Data de Início:
          <input
            type="datetime-local"
            name="dataInicio"
            value={formData.dataInicio}
            onChange={handleChange}
            className="tipodado"
            required
          />
        </label>
        <label>
          Data de Fim:
          <input
            type="datetime-local"
            name="dataFim"
            value={formData.dataFim}
            onChange={handleChange}
            className="tipodado"
            required
          />
        </label>

        <div className="check">
          <div>
            <input
              type="radio"
              id="simples"
              name="tabela"
              value="simples"
              checked={formData.tabela === "simples"}
              onChange={handleChange}
            />
            <label htmlFor="simples">Tabela Simples</label>
          </div>
          <div>
            <input
              type="radio"
              id="completa"
              name="tabela"
              value="completa"
              checked={formData.tabela === "completa"}
              onChange={handleChange}
            />
            <label htmlFor="completa">Tabela Completa</label>
          </div>
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}
        <div className="buttons-container">
          <button className="b" type="submit" id="buscar" disabled={loading}>
          <RiSearch2Line style={{ marginRight: "8px", fontSize: "1.2rem" }} />  {loading ? "Buscando..." : "Buscar"}
          </button>

          <button
            className="b"
            id="baixar"
            type="button"
            onClick={() => exportToCSV(filteredResult)}
            disabled={!filteredResult.length}
          >
            <BsDownload style={{ marginRight: "8px", fontSize: "1.2rem" }}/>   Baixar CSV
          </button>
          <button className="b" id="apagar" type="button" onClick={handleClear}>
          <GiBroom  style={{ marginRight: "8px", fontSize: "1.2rem" }} />    Limpar
          </button>
        </div>
      </form>

      {filteredResult && filteredResult.length > 0 ? (
        <div>
          <h2>Resultado</h2>
          <div className="tabela">
            <table className="table">
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
                    {Object.entries(row).map(([key, value], idx) => (
                      <td key={idx}>
                        {dataColumns.includes(key) &&
                          value &&
                          !isNaN(Date.parse(value))
                          ? format(new Date(value), "dd-MM-yyyy HH:mm")
                          : value || "-"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
      {searchPerformed && filteredResult && filteredResult.length === 0 && (
        <p>Nenhum resultado encontrado</p>
      )}
    </div>
  );
};

export default Queryformadmin;
