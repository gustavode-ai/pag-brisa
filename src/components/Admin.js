import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "font-awesome/css/font-awesome.min.css";
import { IconButton, Tooltip, Dialog, DialogContent, DialogTitle, Button as MuiButton, TextField, CircularProgress } from "@mui/material";
import "./Admin.css";
import DeleteIcon from '@mui/icons-material/Delete'; 
import EditIcon from '@mui/icons-material/Edit'; 
import styled from "styled-components";

// Styling components
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
  padding: 10px;
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
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    nome: "",
    email: "",
    senha: "",
    role: "user",
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newRole, setNewRole] = useState("");


  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:3000/usuarios");
      if (Array.isArray(response.data.data)) {
        setUsers(response.data.data);
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
      setLoading(false);
    }
  };

  // Validate password function (at least 6 characters, includes numbers and special characters)
  const isPasswordValid = (password) => {
    const regex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/;
    return regex.test(password);
  };

  // Validate email function (simple regex for valid email format)
  const isEmailValid = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  // Validate if the username already exists
  const isNameUnique = (name) => {
    return !users.some((user) => user.nome.toLowerCase() === name.toLowerCase());
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();

    // Validate the password
    if (!isPasswordValid(newUser.senha)) {
      toast.error("A senha deve ter pelo menos 6 caracteres, incluir números e caracteres especiais.", {
        autoClose: 2000,
        position: "bottom-left",
      });
      return;
    }

    // Validate the email
    if (!isEmailValid(newUser.email)) {
      toast.error("O e-mail fornecido é inválido. Por favor, insira um e-mail válido.", {
        autoClose: 2000,
        position: "bottom-left",
      });
      return;
    }

    // Validate if the name is unique
    if (!isNameUnique(newUser.nome)) {
      toast.error("Já existe um usuário com este nome. Por favor, escolha outro nome.", {
        autoClose: 2000,
        position: "bottom-left",
      });
      return;
    }

    try {
      setLoading(true);
      await axios.post("http://localhost:3000/criar-usuario", newUser);
      toast.success("Usuário criado com sucesso!", {
        autoClose: 2000,
        position: "bottom-left",
      });
      fetchUsers();
      setNewUser({ nome: "", email: "", senha: "", role: "user" });
    } catch (error) {
      toast.error("Erro ao criar usuário.", {
        autoClose: 2000,
        position: "bottom-left",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      setLoading(true);
      await axios.delete(`http://localhost:3000/usuarios/${selectedUser.id}`);
      toast.success("Usuário deletado com sucesso!", {
        autoClose: 2000,
        position: "bottom-left",
      });
      fetchUsers();
      setShowDeleteDialog(false);
    } catch (error) {
      toast.error("Erro ao deletar usuário.", {
        autoClose: 2000,
        position: "bottom-left",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
  };

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
      // Atualizar senha e role
      await axios.put(`http://localhost:3000/usuarios/${selectedUser.id}`, {
        senha: newPassword,
        role: newRole || selectedUser.role,
      });
      toast.success("Usuário atualizado com sucesso!", {
        autoClose: 2000,
        position: "bottom-left",
      });
      setShowPasswordForm(false);
      fetchUsers(); // Recarregar a lista de usuários
    } catch (error) {
      toast.error("Erro ao atualizar usuário.", {
        autoClose: 2000,
        position: "bottom-left",
      });
    } finally {
      setLoading(false);
      setNewPassword("");
      setNewRole("");
    }
  };
  
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setNewPassword("");
    setNewRole(user.role);
    setShowPasswordForm(true);
  };
  
  

  return (
    <div className="admin-dashboard">
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

      <br />

      <br />
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

                    {/* Botão de Edição */}
                  <Tooltip title="Editar Usuário">
                    <IconButton onClick={() => handleEditUser(user)} disabled={loading}>
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

      {/* Dialog de Alteração de Senha */}
      {showPasswordForm && selectedUser && (
  <Dialog open={showPasswordForm} onClose={() => setShowPasswordForm(false)}>
    <DialogTitle>Editar Usuário</DialogTitle>
    <DialogContent>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleUpdateUser(); // Nova função para atualizar senha e role
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
          SelectProps={{
            native: true,
          }}
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
            style={{ background: "orange", border: "none" }}
          >
            {loading ? "Salvando..." : "Salvar Alterações"}
          </MuiButton>
          <MuiButton
            onClick={() => setShowPasswordForm(false)}
            style={{ marginLeft: 10 }}
            variant="outlined"
          >
            Cancelar
          </MuiButton>
        </div>
      </form>
    </DialogContent>
  </Dialog>
)}


      {/* Dialog de Confirmação de Exclusão */}
      {showDeleteDialog && selectedUser && (
        <Dialog open={showDeleteDialog} onClose={handleCancelDelete}>
          <DialogTitle>Confirmar Exclusão</DialogTitle>
          <DialogContent>
            <p style={{ marginBottom: 30 }}>Você tem certeza que deseja excluir este usuário?</p>
            <div>
              <MuiButton
                onClick={handleDeleteUser}
                color="primary"
                variant="contained"
                style={{ background: 'orange', border: 'none' }}
              >
                Sim, excluir
              </MuiButton>
              <MuiButton onClick={handleCancelDelete} style={{ marginLeft: 100 }} variant="outlined">Cancelar</MuiButton>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <ToastContainer />
    </div>
  );
};

export default AdminDashboard;
