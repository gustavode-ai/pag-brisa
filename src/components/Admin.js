import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "font-awesome/css/font-awesome.min.css";
import {
  IconButton,
  Tooltip,
  Dialog,
  DialogContent,
  DialogTitle,
  Button as MuiButton,
  TextField,
  CircularProgress,
} from "@mui/material";
import "./Admin.css";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import styled from "styled-components";

// Estilizando o formulário com styled-components
const FormContainer = styled.form`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 20px;
  background-color: #fff;
  padding: 20px;
  box-shadow: 0px 0px 5px #ccc;
  border-radius: 5px;
  width: 1000px;
  margin: 0 auto;
  border: 1px solid #ccc;
`;

const InputArea = styled.div`
  display: flex;
  flex-direction: column;
`;

const Input = styled.input`
  width: 150px;
  padding: 0 10px;
  border: 1px solid #bbb;
  border-radius: 5px;
  height: 40px;
`;

const Select = styled.select`
  width: 100%;
  padding: 0 10px;
  border: 1px solid #bbb;
  border-radius: 5px;
  height: 40px;
`;

const Label = styled.label`
  margin-bottom: 5px;
  font-size: 14px;
  color: #333;
`;

const StyledButton = styled.button`
  padding: 1px;
  cursor: pointer;
  border-radius: 5px;
  border: none;
  background-color: rgb(221, 77, 10);
  color: white;
  height: 42px;
  width: 200px;
  font-size: 16px;
  margin-bottom: -20px;
`;

const AdminDashboard = () => {
  const [users, setUsers] = useState([]); // Estado para armazenar a lista de usuários
  const [newUser, setNewUser] = useState({
    nome: "",
    email: "",
    senha: "",
    role: "user",
  }); // Estado para armazenar os dados do novo usuário
  const [selectedUser, setSelectedUser] = useState(null); // Estado para armazenar o usuário selecionado para edição ou exclusão
  const [newPassword, setNewPassword] = useState(""); // Estado para armazenar a nova senha
  const [error, setError] = useState(""); // Estado para erros
  const [loading, setLoading] = useState(false); // Estado para controle de loading
  const [showPasswordForm, setShowPasswordForm] = useState(false); // Estado para exibir ou ocultar o formulário de edição de senha
  const [showDeleteDialog, setShowDeleteDialog] = useState(false); // Estado para controle do diálogo de exclusão
  const [newRole, setNewRole] = useState(""); // Estado para armazenar o novo cargo

  // Efeito colateral para carregar os usuários ao carregar o componente
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3000/usuarios"); // Fazendo a requisição para buscar os usuários
      if (Array.isArray(response.data.data)) {
        setUsers(response.data.data); // Atualiza o estado com os usuários recebidos
      } else {
        throw new Error("Resposta inesperada da API");
      }
    } catch (error) {
      setError("Erro ao carregar usuários. Tente novamente.");
      toast.error("Erro ao carregar usuários. Tente novamente.", {
        autoClose: 2000,
        position: "bottom-left",
      });
    } finally {
      setLoading(false); // Finaliza o carregamento
    }
  };

  // Função para validar a senha
  const isPasswordValid = (password) => {
    const regex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/;
    return regex.test(password);
  };

  // Função para validar o e-mail
  const isEmailValid = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  // Função para verificar se o nome do usuário é único
  const isNameUnique = (name) => {
    return !users.some(
      (user) => user.nome.toLowerCase() === name.toLowerCase()
    );
  };

  // Função para criar um novo usuário
  const handleCreateUser = async (e) => {
    e.preventDefault();

    // Validação da senha
    if (!isPasswordValid(newUser.senha)) {
      toast.error(
        "A senha deve ter pelo menos 6 caracteres, incluir números e caracteres especiais.",
        {
          autoClose: 2000,
          position: "bottom-left",
        }
      );
      return;
    }

    // Validação do e-mail
    if (!isEmailValid(newUser.email)) {
      toast.error(
        "O e-mail fornecido é inválido. Por favor, insira um e-mail válido.",
        {
          autoClose: 2000,
          position: "bottom-left",
        }
      );
      return;
    }

    // Validação do nome
    if (!isNameUnique(newUser.nome)) {
      toast.error(
        "Já existe um usuário com este nome. Por favor, escolha outro nome.",
        {
          autoClose: 2000,
          position: "bottom-left",
        }
      );
      return;
    }

    try {
      setLoading(true);
      await axios.post("http://localhost:3000/criar-usuario", newUser); // Cria o usuário via API
      toast.success("Usuário criado com sucesso!", {
        autoClose: 2000,
        position: "bottom-left",
      });
      fetchUsers(); // Recarrega a lista de usuários
      setNewUser({ nome: "", email: "", senha: "", role: "user" }); // Limpa os campos do formulário
    } catch (error) {
      toast.error("Erro ao criar usuário.", {
        autoClose: 2000,
        position: "bottom-left",
      });
    } finally {
      setLoading(false); // Finaliza o carregamento
    }
  };

  // Função para excluir o usuário
  const handleDeleteUser = async () => {
    try {
      setLoading(true);
      await axios.delete(`http://localhost:3000/usuarios/${selectedUser.id}`); // Exclui o usuário via API
      toast.success("Usuário deletado com sucesso!", {
        autoClose: 2000,
        position: "bottom-left",
      });
      fetchUsers(); // Recarrega a lista de usuários
      setShowDeleteDialog(false); // Fecha o diálogo de exclusão
    } catch (error) {
      toast.error("Erro ao deletar usuário.", {
        autoClose: 2000,
        position: "bottom-left",
      });
    } finally {
      setLoading(false); // Finaliza o carregamento
    }
  };

  // Função para cancelar a exclusão do usuário
  const handleCancelDelete = () => {
    setShowDeleteDialog(false); // Fecha o diálogo de exclusão
  };

  // Função para atualizar o usuário
  const handleUpdateUser = async () => {
    // Validação da senha
    if (newPassword && !isPasswordValid(newPassword)) {
      toast.error(
        "A senha deve ter pelo menos 6 caracteres, incluir números e caracteres especiais.",
        {
          autoClose: 2000,
          position: "bottom-left",
        }
      );
      return;
    }

    try {
      setLoading(true);
      // Atualiza o usuário via API
      await axios.put(`http://localhost:3000/usuarios/${selectedUser.id}`, {
        senha: newPassword,
        role: newRole || selectedUser.role,
      });
      toast.success("Usuário atualizado com sucesso!", {
        autoClose: 2000,
        position: "bottom-left",
      });
      setShowPasswordForm(false); // Fecha o formulário de edição
      fetchUsers(); // Recarrega a lista de usuários
    } catch (error) {
      toast.error("Erro ao atualizar usuário.", {
        autoClose: 2000,
        position: "bottom-left",
      });
    } finally {
      setLoading(false); // Finaliza o carregamento
      setNewPassword(""); // Limpa o campo de senha
      setNewRole(""); // Limpa o campo de role
    }
  };

  // Função para editar o usuário
  const handleEditUser = (user) => {
    setSelectedUser(user); // Define o usuário selecionado
    setNewPassword(""); // Limpa o campo de senha
    setNewRole(user.role); // Define o role do usuário
    setShowPasswordForm(true); // Exibe o formulário de edição
  };

  return (
    <div className="admin-dashboard">
      {/* Formulário para cadastro de usuário */}
      <h1>Cadastrar Usuário</h1>
      <FormContainer onSubmit={handleCreateUser}>
        <InputArea>
          <Label>Nome</Label>
          <Input
            type="text"
            placeholder="Nome"
            value={newUser.nome}
            onChange={(e) => setNewUser({ ...newUser, nome: e.target.value })}
            required
          />
        </InputArea>

        <InputArea>
          <Label>Email</Label>
          <Input
            type="email"
            placeholder="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            required
          />
        </InputArea>

        <InputArea>
          <Label>Senha</Label>
          <Input
            type="password"
            placeholder="Senha"
            value={newUser.senha}
            onChange={(e) => setNewUser({ ...newUser, senha: e.target.value })}
            required
          />
        </InputArea>

        <InputArea>
          <Label>Função</Label>
          <Select
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
          >
            <option value="user">Usuário</option>
            <option value="admin">Administrador</option>
          </Select>
        </InputArea>

        <StyledButton type="submit" disabled={loading}>
          {loading ? "Criando..." : "Criar Usuário"}
        </StyledButton>
      </FormContainer>

      {/* Tabela de usuários cadastrados */}
      <section>
        <h2>Usuários Cadastrados</h2>
        {users.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Usuário</th>
                <th>Email</th>
                <th>Tipo</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.nome}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    {/* Botões de Edição e Exclusão */}
                    <Tooltip title="Editar Usuário">
                      <IconButton
                        onClick={() => handleEditUser(user)}
                        disabled={loading}
                      >
                        <EditIcon color="primary" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Excluir">
                      <IconButton
                        onClick={() => {
                          setSelectedUser(user);
                          setShowDeleteDialog(true);
                        }}
                        disabled={loading}
                      >
                        <DeleteIcon style={{ color: "rgb(255, 0, 0)" }} />
                      </IconButton>
                    </Tooltip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Nenhum usuário encontrado.</p>
        )}
      </section>

      {/* Diálogos de Edição de Senha e Exclusão */}
      {showPasswordForm && selectedUser && (
        <Dialog
          open={showPasswordForm}
          onClose={() => setShowPasswordForm(false)}
        >
          <DialogTitle>Editar Usuário</DialogTitle>
          <DialogContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateUser();
              }}
            >
              <TextField
                label="Nova Senha"
                type="password"
                fullWidth
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ marginBottom: 20 }}
              />
              <TextField
                label="Role"
                select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                fullWidth
                SelectProps={{ native: true }}
                required
              >
                <option value="user">Usuário</option>
                <option value="admin">Administrador</option>
              </TextField>
              <div style={{ marginTop: 20 }}>
                <MuiButton
                  type="submit"
                  color="primary"
                  variant="contained"
                  disabled={loading}
                  style={{ background: "orange" }}
                >
                  {loading ? "Salvando..." : "Salvar Alterações"}
                </MuiButton>
                <MuiButton
                  onClick={() => setShowPasswordForm(false)}
                  variant="outlined"
                  style={{ marginLeft: 10 }}
                >
                  Cancelar
                </MuiButton>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Diálogo de confirmação de exclusão */}
      <Dialog open={showDeleteDialog} onClose={handleCancelDelete}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <p>Tem certeza que deseja excluir este usuário?</p>
          <div style={{ marginTop: 20 }}>
          <MuiButton
              onClick={handleDeleteUser}
              style={{ background: "rgb(255, 0, 0)" }}
              variant="contained"
            >
              Excluir
            </MuiButton>
            <MuiButton
              onClick={handleCancelDelete}
              variant="outlined"
              style={{ marginLeft: '100px'}}
            >
              Cancelar
            </MuiButton>
            
          </div>
        </DialogContent>
      </Dialog>

      {/* Toasts de notificação */}
      <ToastContainer />
    </div>
  );
};

export default AdminDashboard;
