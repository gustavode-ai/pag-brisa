import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaSearch } from "react-icons/fa";
import Pagination from "@mui/material/Pagination";
import "./SmsAnalise.css";

const SmsAnaliseadmin = () => {
  const [data, setData] = useState([]);
    const [headers, setHeaders] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 25; // Define o número de linhas por página
  
    const sheetId = "1uWOSPiHnTRsXDx0nmP1KNT4YPyy2QBjc3P8UOrmrbTk";
    const apiKey = "AIzaSyCqNGbgh5Epo4o_BxiUTCANOH2RYLpLa24";
    const range = "Folha1!A:C";
  
    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await axios.get(
            `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`
          );
          const sheetData = response.data.values || [];
          if (sheetData.length > 0) {
            setHeaders(sheetData[0]);
            setData(sheetData.slice(1));
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
  
    const filteredData = data.filter((row) =>
      row.some((cell) =>
        cell?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  
    const indexOfLastRecord = currentPage * rowsPerPage;
    const indexOfFirstRecord = indexOfLastRecord - rowsPerPage;
    const currentRecords = filteredData.slice(
      indexOfFirstRecord,
      indexOfLastRecord
    );
  
    return (
      <div className="sms-analise-container">
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar por APLICATIVO ou Brocker"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          <FaSearch className="search-icon" />
        </div>
  
        <div className="sms-table">
          <table className="sms-tabela">
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
                    {row.map((cell, cellIndex) => {
                      // Verifica se a célula é a última da linha
                      const isLastCell = cellIndex === row.length - 1;
  
                      // Define a cor com base no valor da célula
                      let cellColor;
                      if (
                        isLastCell &&
                        cell.toString().toLowerCase() === "nenhum"
                      ) {
                        cellColor = "red"; 
                      } else if (
                        cell.toString().toLowerCase() === "apenas portado"
                      ) {
                        cellColor = "orange"; 
                      } else {
                        cellColor = "black"; 
                      }
  
                      return (
                        <td key={cellIndex} style={{ color: cellColor }}>
                          {cell}
                        </td>
                      );
                    })}
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

export default SmsAnaliseadmin;
