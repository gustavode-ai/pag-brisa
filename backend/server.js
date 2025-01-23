const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./db");
const bcrypt = require("bcrypt");


const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());


// Endpoint inicial
app.get("/", (req, res) => {
  res.send("Servidor funcionando!");
});

// Endpoint para login
const jwt = require("jsonwebtoken");
 
const SECRET_KEY = "chaveteste"; 

app.post("/login", async (req, res) => {
  const { nome, senha } = req.body;

  if (!nome || !senha) {
    return res.status(400).json({ success: false, error: "Nome e senha são obrigatórios." });
  }

  const query = "SELECT * FROM usuarios WHERE nome = ?";
  db.query(query, [nome], async (err, results) => {
    if (err) {
      console.error("Erro ao acessar o banco de dados:", err.message);
      return res.status(500).json({ success: false, error: "Erro interno no servidor." });
    }

    if (results.length === 0) {
      return res.status(401).json({ success: false, error: "Credenciais inválidas." });
    }

    const user = results[0];

    const isPasswordCorrect = await bcrypt.compare(senha, user.senha);

    if (isPasswordCorrect) {
      // Gerar o token JWT
      const token = jwt.sign(
        { id: user.id, nome: user.nome, role: user.role },
        SECRET_KEY,
        { expiresIn: "1m" } 
      );

      res.json({ 
        success: true, 
        message: "Login bem-sucedido!", 
        token, // Retorna o token ao cliente
        nome: user.nome,    
        role: user.role     
      });
    } else {
      res.status(401).json({ success: false, error: "Credenciais inválidas." });
    }
  });
});



// Endpoint para consultas
app.post("/query", (req, res) => {
  const { tipoDado, tipoNumero, numero, dataInicio, dataFim } = req.body;

  const tabela = tipoDado === "cdrs_sms" ? "cdrs_sms" : "qa_cdrs_chamadas";
  const campoNumero = tipoNumero === "numeroOrigem" ? "numeroOrigem" : "numeroDestino";

  let query = "";
  if (tabela === "cdrs_sms") {
    query = `
      SELECT * 
      FROM ${tabela} 
      WHERE ${campoNumero} = ? 
      AND horarioRegistro BETWEEN ? AND ?`;
  } else if (tabela === "qa_cdrs_chamadas") {
    query = `
      SELECT * 
      FROM ${tabela} 
      WHERE ${campoNumero} = ? 
      AND dataChamada BETWEEN ? AND ?`;
  }

  db.query(query, [numero, dataInicio, dataFim], (err, results) => {
    if (err) {
      console.error("Erro na consulta ao banco:", err.message);
      return res.status(500).json({ success: false, error: "Erro ao acessar o banco de dados." });
    }

    res.json({ success: true, data: results });
  });
});

// Endpoint para listar usuários
app.get("/usuarios", (req, res) => {
  const query = "SELECT * FROM usuarios";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Erro ao listar usuários:", err.message);
      return res.status(500).json({ success: false, error: "Erro ao listar usuários." });
    }
    res.json({ success: true, data: results });
  });
});

// Endpoint para criar usuário
app.post("/criar-usuario", async (req, res) => {
  const { nome, email, senha, role } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ success: false, error: "Todos os campos são obrigatórios." });
  }

  if (role && !["admin", "user"].includes(role)) {
    return res.status(400).json({ success: false, error: "Papel do usuário inválido." });
  }

  try {
    const hashedSenha = await bcrypt.hash(senha, 10);

    const query = `
      INSERT INTO usuarios (nome, email, senha, role)
      VALUES (?, ?, ?, ?)`;

    db.query(query, [nome, email, hashedSenha, role || "user"], (err) => {
      if (err) {
        console.error("Erro ao criar o usuário:", err.message);
        return res.status(500).json({ success: false, error: "Erro ao criar o usuário." });
      }

      res.json({ success: true, message: "Usuário criado com sucesso!" });
    });
  } catch (error) {
    console.error("Erro ao criar usuário:", error.message);
    res.status(500).json({ success: false, error: "Erro interno no servidor." });
  }
});

// Endpoint para apagar usuário
app.delete("/usuarios/:id", (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM usuarios WHERE id = ?";
  db.query(query, [id], (err) => {
    if (err) {
      console.error("Erro ao apagar usuário:", err.message);
      return res.status(500).json({ success: false, error: "Erro ao apagar usuário." });
    }
    res.json({ success: true, message: "Usuário apagado com sucesso!" });
  });
});

app.post('/add-sms-bulk', (req, res) => {
  const records = req.body.records;

  if (!Array.isArray(records)) {
    return res.status(400).json({ error: "Formato inválido" });
  }

  // Mock do processo de inserção no banco de dados
  let insertedRecords = [];

  // Lógica para inserir no banco de dados
  records.forEach(record => {
    const { aplicativo, brocker, numerosFunciona } = record;

    if (!aplicativo || !brocker || !numerosFunciona) {
      return res.status(400).json({ success: false, error: "Todos os campos são obrigatórios." });
    }

    let funcionaEm = 'nenhum'; // Valor default
    if (numerosFunciona === "ambos") {
      funcionaEm = "ambos"; // Caso "ambos" seja enviado
    } else if (numerosFunciona === "portados") {
      funcionaEm = "portados"; // Caso "portados" seja enviado
    } else if (numerosFunciona === "base") {
      funcionaEm = "base"; // Caso "base" seja enviado
    }

    // Verificar se o valor de 'funcionaEm' é válido
    const validValues = ['portados', 'base', 'ambos', 'nenhum'];
    if (!validValues.includes(funcionaEm)) {
      return res.status(400).json({ success: false, error: "Valor inválido para 'numerosFunciona'." });
    }

    // Inserir o registro no banco de dados
    const query = "INSERT INTO sms_analise (aplicativo, brocker, numerosFunciona) VALUES (?, ?, ?)";
    db.query(query, [aplicativo, brocker, funcionaEm], (err, result) => {
      if (err) {
        console.error("Erro ao salvar registro:", err.message);
        return res.status(500).json({ success: false, error: "Erro ao salvar no banco de dados." });
      }

      
      insertedRecords.push({ id: result.insertId, aplicativo, brocker, numerosFunciona: funcionaEm });

      
      if (insertedRecords.length === records.length) {
        res.json({
          success: true,
          message: "Registros inseridos com sucesso!",
          data: insertedRecords
        });
      }
    });
  });
});


// Endpoint para alterar senha de um usuário
app.put("/usuarios/:id", async (req, res) => {
  const { id } = req.params;
  const { senha, role } = req.body;

  
  if (!senha && !role) {
    return res.status(400).json({ success: false, error: "A senha ou o role precisam ser fornecidos." });
  }

  let hashedSenha;


  if (senha) {
    try {
      hashedSenha = await bcrypt.hash(senha, 10);
    } catch (error) {
      console.error("Erro ao gerar hash da senha:", error.message);
      return res.status(500).json({ success: false, error: "Erro interno ao processar a senha." });
    }
  }

  
  let query = "UPDATE usuarios SET ";
  const params = [];

  // Se a senha foi fornecida, adicionar a senha à query
  if (senha) {
    query += "senha = ?";
    params.push(hashedSenha);
  }

  // Se o role foi fornecido, adicionar o role à query
  if (role) {
    if (senha) query += ", ";  // Adiciona vírgula se a senha já foi incluída
    query += "role = ?";
    params.push(role);
  }

  // Finalizar a query com o ID do usuário
  query += " WHERE id = ?";
  params.push(id);

  try {
    db.query(query, params, (err) => {
      if (err) {
        console.error("Erro ao atualizar usuário:", err.message);
        return res.status(500).json({ success: false, error: "Erro ao atualizar usuário." });
      }
      res.json({ success: true, message: "Usuário atualizado com sucesso!" });
    });
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error.message);
    res.status(500).json({ success: false, error: "Erro interno no servidor." });
  }
});


// Endpoint para adicionar um novo registro de SMS
app.post("/add-sms", (req, res) => {
  const { aplicativo, brocker, numerosFunciona } = req.body;

  // Validação dos campos
  if (!aplicativo || !brocker || !numerosFunciona) {
    return res.status(400).json({ success: false, error: "Todos os campos são obrigatórios." });
  }

  // Definir a variável 'funcionaEm' com base nos checkboxes
  let funcionaEm = 'nenhum'; // Valor default
  if (numerosFunciona === "ambos") {
    funcionaEm = "ambos"; // Caso "ambos" seja enviado
  } else if (numerosFunciona === "portados") {
    funcionaEm = "portados"; // Caso "portados" seja enviado
  } else if (numerosFunciona === "base") {
    funcionaEm = "base"; // Caso "base" seja enviado
  }

  // Verificar se o valor de 'funcionaEm' é válido
  const validValues = ['portados', 'base', 'ambos', 'nenhum'];
  if (!validValues.includes(funcionaEm)) {
    return res.status(400).json({ success: false, error: "Valor inválido para 'numerosFunciona'." });
  }

  // Inserir os dados no banco
  const query = "INSERT INTO sms_analise (aplicativo, brocker, numerosFunciona) VALUES (?, ?, ?)";
  db.query(query, [aplicativo, brocker, funcionaEm], (err, result) => {
    if (err) {
      console.error("Erro ao salvar registro:", err.message);
      return res.status(500).json({ success: false, error: "Erro ao salvar no banco de dados." });
    }
    res.json({ success: true, message: "Registro adicionado com sucesso!" });
  });
});

// Endpoint para listar os registros de SMS
app.get("/get-sms", (req, res) => {
  const query = "SELECT * FROM sms_analise";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Erro ao consultar registros:", err.message);
      return res.status(500).json({ success: false, error: "Erro ao acessar o banco de dados." });
    }
    res.json({ success: true, data: results });
  });
});

// Endpoint para editar um registro de SMS
app.put("/edit-sms/:id", (req, res) => {
  const { id } = req.params;
  const { aplicativo, brocker, numerosFunciona } = req.body;

  // Validação dos campos
  if (!aplicativo || !brocker || !numerosFunciona) {
    return res.status(400).json({ success: false, error: "Todos os campos são obrigatórios." });
  }

  // Definir a variável 'funcionaEm' com base nos checkboxes
  let funcionaEm = 'nenhum'; // Valor default
  if (numerosFunciona === "ambos") {
    funcionaEm = "ambos"; // Caso "ambos" seja enviado
  } else if (numerosFunciona === "portados") {
    funcionaEm = "portados"; // Caso "portados" seja enviado
  } else if (numerosFunciona === "base") {
    funcionaEm = "base"; // Caso "base" seja enviado
  }

  // Verificar se o valor de 'funcionaEm' é válido
  const validValues = ['portados', 'base', 'ambos', 'nenhum'];
  if (!validValues.includes(funcionaEm)) {
    return res.status(400).json({ success: false, error: "Valor inválido para 'numerosFunciona'." });
  }
  

  // Atualizando os dados no banco
  const query = "UPDATE sms_analise SET aplicativo = ?, brocker = ?, numerosFunciona = ? WHERE id = ?";
  db.query(query, [aplicativo, brocker, funcionaEm, id], (err, result) => {
    if (err) {
      console.error("Erro ao atualizar registro:", err.message);
      return res.status(500).json({ success: false, error: "Erro ao atualizar no banco de dados." });
    }
    res.json({ success: true, message: "Registro atualizado com sucesso!" });
  });
});

// deletando registro
app.delete("/delete-sms/:id", (req, res) => {
  const { id } = req.params; // Pega o ID da URL
  console.log("ID recebido para exclusão:", id); 

  const query = "DELETE FROM sms_analise WHERE id = ?";
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Erro ao deletar registro:", err.message);
      return res.status(500).json({ success: false, error: "Erro ao deletar o registro." });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: "Registro não encontrado." });
    }
    res.json({ success: true, message: "Registro deletado com sucesso!" });
  });
});

// Inicia o servidor
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
