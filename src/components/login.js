import { useState } from "react";
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "./login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Controla a exibição da senha
  const [isPasswordFocused, setIsPasswordFocused] = useState(false); // Controla o foco do campo de senha
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const togglePasswordVisibility = (event) => {
    event.preventDefault(); // Impede que o clique remova o foco
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!username || !password) {
      setErrorMessage("Nome de usuário e senha são obrigatórios.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: username, 
          senha: password, 
        }),
      });

      const data = await response.json();

      if (response.status === 200) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userRole", data.role);
        localStorage.setItem("userName", data.nome);
        localStorage.setItem("token", data.token); 

        if (data.role === "admin") {
          navigate("/queryformadmin");
        } else {
          navigate("/QueryForm");
        }
      } else {
        setErrorMessage(data.error || "Erro desconhecido");
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      setErrorMessage("Erro ao tentar fazer login");
    }
  };

  return (
    <div className="containero">
      <form onSubmit={handleSubmit}>
        <h1 className="titulo">Login</h1>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <div className="input-field">
          <input
            type="text"
            placeholder="Usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <FaUser className="icon" />
        </div>
        <div className="input-field">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setIsPasswordFocused(true)}
            onBlur={() => setIsPasswordFocused(false)}
          />
          {isPasswordFocused ? (
            <span
              className="password-toggle"
              onMouseDown={togglePasswordVisibility}
              style={{ cursor: "pointer" }}
            >
              {showPassword ? (
                <FaEyeSlash className="icon" />
              ) : (
                <FaEye className="icon" />
              )}
            </span>
          ) : (
            <FaLock className="icon" />
          )}
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
