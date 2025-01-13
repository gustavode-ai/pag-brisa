import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Desbloqueio.css';

const Desbloqueio = () => {
  const [idCliente, setIdCliente] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [noticias, setNoticias] = useState([]); // Estado para as notícias
  const navigate = useNavigate();

  // Verifica permissão
  const checkPermission = () => {
    const role = localStorage.getItem('userRole');
    return role === 'admin';
  };

  // Função para buscar notícias da API
  const fetchNoticias = async () => {
    try {
      const response = await axios.get(
        `https://newsapi.org/v2/everything?q=tesla & from=2024-12-02&sortBy=publishedAt&apiKey=08712edbde554b3582f8f17438ed3ae8`
      );
      setNoticias(response.data.articles || []);
    } catch (error) {
      console.error('Erro ao buscar notícias:', error);
    }
  };

  // Busca notícias ao carregar o componente
  useEffect(() => {
    fetchNoticias();
  }, []);

  // Função de desbloqueio
  const handleDesbloqueio = async (e) => {
    e.preventDefault();

    if (!idCliente) {
      setMessage('Por favor, insira a linha do cliente.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:3000/desbloquear',
        { idCliente },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      if (response.data.success) {
        setMessage('Cliente desbloqueado com sucesso e e-mail enviado.');
      } else {
        setMessage(response.data.message || 'Erro ao desbloquear linha do cliente.');
      }
    } catch (error) {
      setMessage('Erro de comunicação com o servidor.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Redireciona se o usuário não tiver permissão
  if (!checkPermission()) {
    navigate('/');
    return null;
  }

  return (
  <div> 
   <div className="desbloqueio-container">
      <h1>Desbloqueio de Suspensão por Fraude</h1>
      <form className="form" onSubmit={handleDesbloqueio}>
        <input
          type="text"
          placeholder="Linha do Cliente"
          maxLength={13}
          value={idCliente}
          onChange={(e) => setIdCliente(e.target.value)}
          required
        />
        <button type="submit" id="b" disabled={loading}>
          {loading ? 'Desbloqueando...' : 'Desbloquear Cliente'}
        </button>
      </form>
      {message && <p>{message}</p>}
      
      
      
      </div>
      <h2>Últimas Notícias</h2>
      <div className="noticias-container">
        {noticias.length > 0 ? (
          noticias.map((noticia, index) => (
            <div key={index} className="noticia">
              <h3>{noticia.title}</h3>
              <p>{noticia.description}</p>
              <a href={noticia.url} target="_blank" rel="noopener noreferrer">
                Leia mais
              </a>
            </div>
          ))
        ) : (
          <p>Carregando notícias...</p>
        )}
      </div>
    </div>
  );
};

export default Desbloqueio;
