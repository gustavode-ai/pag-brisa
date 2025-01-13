import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaSearch } from "react-icons/fa";
import Pagination from "@mui/material/Pagination"; 
import "./Tacs.css";

const Tac = () => {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10; // Define o número de linhas por página

  const sheetId = "1T50RZ122YIqSMGvU_BgowBvNpUm93b41D6p6yyeaEAM";
  const apiKey = "AIzaSyCqNGbgh5Epo4o_BxiUTCANOH2RYLpLa24";
  const range = "Folha1!A:O";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`
        );
        const sheetData = response.data.values || [];
        if (sheetData.length > 0) {
          setHeaders(sheetData[0]); // Define a primeira linha como cabeçalho
          setData(sheetData.slice(1)); // Define os dados excluindo a primeira linha
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        setHeaders([]);
        setData([]);
      }
    };

    fetchData();
  }, []);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  // Filtra os dados com base no termo de busca
  const filteredData = data.filter((row) =>
    row.some((cell) =>
      cell?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  
  const indexOfLastRecord = currentPage * rowsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - rowsPerPage;
  const currentRecords = filteredData.slice(indexOfFirstRecord, indexOfLastRecord);

  return (
    <div className="tacs-container">
      
      <div className="search-container">
        <input
          type="text"
          placeholder="Buscar por TAC ou Cidade"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); 
          }}
        />
        <FaSearch className="search-icon" />
      </div>

      <div className="tac-tabela">
        <table className="tac-table">
          <thead>
            <tr>
              {headers.map((header, index) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentRecords.length > 0 ? (
              currentRecords.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      style={
                        cellIndex === row.length - 1 // Verifica se é a última célula
                          ? {
                              color:
                                cell.toString().toLowerCase() === "cadastrado"
                                  ? "green"
                                  : "red",
                            }
                          : {}
                      }
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={headers.length} style={{ textAlign: "center" }}>
                  {data.length === 0
                    ? "Carregando dados..."
                    : "Nenhum resultado encontrado"}
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>

      
      <div className="pagination">
        <Pagination
          count={Math.ceil(filteredData.length / rowsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
        />
      </div>
    </div>
  );
};

export default Tac;
