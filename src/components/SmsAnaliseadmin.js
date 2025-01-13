import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  IconButton,
  Tooltip,
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FilterListIcon from "@mui/icons-material/FilterList";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Papa from "papaparse";
import SortIcon from "@mui/icons-material/Sort";
import { Pagination } from "@mui/material";
import "./SmsAnalise.css";

const SmsAnaliseadmin = () => {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [newRecord, setNewRecord] = useState({
    aplicativo: "",
    brocker: "",
    numerosFunciona: { portados: false, base: false },
  });
  const [editingId, setEditingId] = useState(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const [filter, setFilter] = useState({ aplicativo: "", brocker: "" });
  const [loading, setLoading] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortDirection, setSortDirection] = useState("asc");
  const recordsPerPage = 12;

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:3000/get-sms");
      setRecords(response.data.data);
      setFilteredRecords(response.data.data);
      setTotalRecords(response.data.data.length);
    } catch (error) {
      console.error("Erro ao carregar registros:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleSort = () => {
    const sorted = [...filteredRecords].sort((a, b) => {
      const field = "aplicativo"; // Ordenação por "aplicativo"
      if (sortDirection === "asc") {
        return a[field].localeCompare(b[field]);
      } else {
        return b[field].localeCompare(a[field]);
      }
    });

    setFilteredRecords(sorted);
    setSortDirection(sortDirection === "asc" ? "desc" : "asc"); // Alterna a direção
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let funcionaEm = "nenhum";
    if (newRecord.numerosFunciona.portados && newRecord.numerosFunciona.base) {
      funcionaEm = "ambos";
    } else if (newRecord.numerosFunciona.portados) {
      funcionaEm = "portados";
    } else if (newRecord.numerosFunciona.base) {
      funcionaEm = "base";
    }

    const dataToSend = {
      aplicativo: newRecord.aplicativo,
      brocker: newRecord.brocker,
      numerosFunciona: funcionaEm,
    };

    try {
      if (editingId) {
        await axios.put(
          `http://localhost:3000/edit-sms/${editingId}`,
          dataToSend
        );
        setEditingId(null);
        toast.success("Registro atualizado com sucesso!");
      } else {
        await axios.post("http://localhost:3000/add-sms", dataToSend);
        toast.success("Registro adicionado com sucesso!");
      }
      fetchRecords();
      setNewRecord({
        aplicativo: "",
        brocker: "",
        numerosFunciona: { portados: false, base: false },
      });
      setOpenAddDialog(false);
    } catch (error) {
      console.error("Erro ao salvar o registro:", error);
      toast.error("Erro ao salvar o registro!");
    }
  };

  const handleEdit = (record) => {
    setNewRecord({
      aplicativo: record.aplicativo,
      brocker: record.brocker,
      numerosFunciona: {
        portados:
          record.numerosFunciona === "portados" ||
          record.numerosFunciona === "ambos",
        base:
          record.numerosFunciona === "base" ||
          record.numerosFunciona === "ambos",
      },
    });
    setEditingId(record.id);
    setOpenAddDialog(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:3000/delete-sms/${deleteId}`);
      fetchRecords();
      setOpenDeleteDialog(false);
      setDeleteId(null);
      toast.success("Registro excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir o registro:", error);
      toast.error("Erro ao excluir o registro!");
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
  };

  const applyFilter = () => {
    const filtered = records.filter(
      (record) =>
        (!filter.aplicativo ||
          record.aplicativo
            .toLowerCase()
            .includes(filter.aplicativo.toLowerCase())) &&
        (!filter.brocker ||
          record.brocker
            .toLowerCase()
            .includes(filter.brocker.toLowerCase()))
    );
    setFilteredRecords(filtered);
    setTotalRecords(filtered.length); // Atualiza o total de registros após o filtro
    setOpenFilterDialog(false);
  };

  const handleCsvUpload = async () => {
    if (!csvFile) {
      toast.error("Por favor, selecione um arquivo CSV.");
      return;
    }

    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (result) => {
        try {
          const records = result.data.map((row) => {
            let numerosFunciona = { portados: false, base: false };

            const portados =
              row.portados && row.portados.trim().toUpperCase() === "TRUE";
            const base = row.base && row.base.trim().toUpperCase() === "TRUE";

            let funcionaEm = "nenhum";
            if (portados && base) {
              funcionaEm = "ambos";
            } else if (portados) {
              funcionaEm = "portados";
            } else if (base) {
              funcionaEm = "base";
            }

            return {
              aplicativo: row.APLICATIVOS?.trim(),
              brocker: row.BROKER?.trim(),
              numerosFunciona: funcionaEm,
            };
          });

          await axios.post("http://localhost:3000/add-sms-bulk", { records });
          toast.success("Registros do CSV adicionados com sucesso!");
          setCsvFile(null);
          setOpenAddDialog(false);
          fetchRecords();
        } catch (error) {
          console.error("Erro ao processar o CSV:", error);
          toast.error("Erro ao adicionar registros do CSV.");
        }
      },
      error: (error) => {
        console.error("Erro ao fazer o parse do CSV:", error);
        toast.error("Erro ao processar o arquivo CSV.");
      },
    });
  };

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );

  return (
    <div className="sms-analise-container">
      <h1>Análise de Recebimento de SMS</h1>

      <div className="sms-analise-action-buttons">
        <Tooltip title="Adicionar">
          <IconButton onClick={() => setOpenAddDialog(true)}>
            <AddIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Filtrar">
          <IconButton onClick={() => setOpenFilterDialog(true)}>
            <FilterListIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={`Ordenar (${sortDirection === "asc" ? "A-Z" : "Z-A"})`}>
          <IconButton onClick={handleSort}>
            <SortIcon />
          </IconButton>
        </Tooltip>
      </div>

      {loading ? (
        <div className="sms-analise-loading-spinner">
          <CircularProgress />
        </div>
      ) : (
        <>
          
          <table className="sms-table">
            <thead>
              <tr>
                <th>Aplicativo</th>
                <th>Broker</th>
                <th>Funciona em</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {currentRecords.map((record) => (
                <tr key={record.id}>
                  <td>{record.aplicativo}</td>
                  <td>{record.brocker}</td>
                  <td>{record.numerosFunciona}</td>
                  <td>
                    <Tooltip title="Editar">
                      <IconButton onClick={() => handleEdit(record)}>
                        <EditIcon style={{ color: "rgba(0, 89, 255, 0.94)" }} />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Excluir">
                      <IconButton
                        onClick={() => {
                          setDeleteId(record.id);
                          setOpenDeleteDialog(true);
                        }}
                      >
                        <DeleteIcon color="error" />
                      </IconButton>
                    </Tooltip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <Pagination
            count={Math.ceil(totalRecords / recordsPerPage)}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            siblingCount={2}
            boundaryCount={1}
          />

          <div className="sms-record-count">
            <p>
              Mostrando {indexOfFirstRecord + 1} a{" "}
              {Math.min(indexOfLastRecord, totalRecords)} de {totalRecords}{" "}
              registros
            </p>
          </div>
        </>
        
      )}

      {/* Dialog de Adição e Edição */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
        <DialogTitle>{editingId ? "Editar Registro" : "Adicionar Registro"}</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Aplicativo"
              value={newRecord.aplicativo}
              onChange={(e) =>
                setNewRecord({ ...newRecord, aplicativo: e.target.value })
              }
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label="Broker"
              value={newRecord.brocker}
              onChange={(e) =>
                setNewRecord({ ...newRecord, brocker: e.target.value })
              }
              fullWidth
              required
              margin="normal"
            />

            <div>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newRecord.numerosFunciona.portados}
                    onChange={(e) =>
                      setNewRecord({
                        ...newRecord,
                        numerosFunciona: {
                          ...newRecord.numerosFunciona,
                          portados: e.target.checked,
                        },
                      })
                    }
                    color="primary"
                  />
                }
                label="Portados"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newRecord.numerosFunciona.base}
                    onChange={(e) =>
                      setNewRecord({
                        ...newRecord,
                        numerosFunciona: {
                          ...newRecord.numerosFunciona,
                          base: e.target.checked,
                        },
                      })
                    }
                    color="primary"
                  />
                }
                label="Base"
              />
            </div>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              style={{ marginTop: "20px" }}
            >
              {editingId ? "Atualizar" : "Adicionar"}
            </Button>
          </form>
        </DialogContent>
        <DialogContent>
            <h4>Adição em Massa por CSV</h4>
            <label htmlFor="csvFileInput" style={{ color: "#aaa", fontSize: "14px" }}>
              Escolha um arquivo CSV
            </label>
            <input
              id="csvFileInput"
              type="file"
              accept=".csv"
              onChange={(e) => setCsvFile(e.target.files[0])}
              style={{
                marginBottom: 10,
                display: "block",
                border: "1px solid #ccc",
                borderRadius: "4px",
                padding: "5px",
              }}
            />
            <Button
              onClick={handleCsvUpload}
              variant="contained"

            >
              Enviar CSV
            </Button>
            <p style={{ fontSize: "0.9rem", color: "gray" }}>
              O arquivo deve conter as colunas:{" "}
              <strong>aplicativo, brocker, portados, base</strong>
            </p>
          </DialogContent>
        </Dialog>

        
        

      {/* Dialog de Filtro */}
      <Dialog
        open={openFilterDialog}
        onClose={() => setOpenFilterDialog(false)}
      >
        <DialogTitle>Filtrar Registros</DialogTitle>
        <DialogContent>
          <form>
            <TextField
              label="Aplicativo"
              name="aplicativo"
              value={filter.aplicativo}
              onChange={handleFilterChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Broker"
              name="brocker"
              value={filter.brocker}
              onChange={handleFilterChange}
              fullWidth
              margin="normal"
            />
            <Button
              onClick={applyFilter}
              variant="contained"
              color="primary"
              fullWidth
              style={{ marginTop: "20px" }}
            >
              Aplicar Filtro
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Exclusão */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <p>Você tem certeza de que deseja excluir este registro?</p>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            fullWidth
          >
            Confirmar Exclusão
          </Button>
        </DialogContent>
      </Dialog>

      <ToastContainer />
    </div>
  );
};

export default SmsAnaliseadmin;
