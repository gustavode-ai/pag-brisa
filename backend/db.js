const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "172.23.104.46", 
  user: "gustavo", 
  password: "k*e2hygSl!#O", 
  database: "opr", 
});


db.connect((err) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados:", err.message);
    process.exit(1);
  } else {
    console.log("Conexão ao banco de dados estabelecida com sucesso!");
  }
});

module.exports = db;
