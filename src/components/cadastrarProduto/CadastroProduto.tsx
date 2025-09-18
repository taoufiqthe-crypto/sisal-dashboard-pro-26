// src/components/CadastroProduto.jsx

import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Suas chaves do Supabase
// Obs: Em produção, o ideal é usar variáveis de ambiente
const supabaseUrl = 'https://wsafurylczwyjqhekyhs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzYWZ1cnlsY3p3eWpxaGVreWhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNDY5OTMsImV4cCI6MjA3MzYyMjk5M30.RkksrsiccK0DFMAvVud7U62AMmOIRdCXohjOIhX3xJU';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Definimos o tipo de props que o componente vai receber
// onProductAdded: uma função que será chamada após o cadastro
// para atualizar a lista de produtos na tela principal.
const CadastroProduto = ({ onProductAdded }) => {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState(0);
  const [imagemUrl, setImagemUrl] = useState('');
  const [loading, setLoading] = useState(false);

  // Função que lida com o envio do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Usa o método insert() para adicionar um novo produto
    const { data, error } = await supabase
      .from('produtos')
      .insert([
        {
          nome: nome,
          descricao: descricao,
          preco: preco,
          imagem_url: imagemUrl,
        },
      ]);

    setLoading(false);

    if (error) {
      console.error('Erro ao cadastrar:', error.message);
      alert('Erro ao cadastrar o produto. Tente novamente.');
    } else {
      console.log('Produto cadastrado com sucesso:', data);
      alert('Produto cadastrado com sucesso!');
      
      // Chama a função passada por props para atualizar a lista de produtos
      onProductAdded();
      
      // Limpa os campos do formulário
      setNome('');
      setDescricao('');
      setPreco(0);
      setImagemUrl('');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
      <h2>Adicionar Novo Produto</h2>
      
      <div>
        <label htmlFor="nome">Nome:</label>
        <input
          id="nome"
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="descricao">Descrição:</label>
        <textarea
          id="descricao"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="preco">Preço:</label>
        <input
          id="preco"
          type="number"
          step="0.01"
          value={preco}
          onChange={(e) => setPreco(parseFloat(e.target.value))}
          required
        />
      </div>

      <div>
        <label htmlFor="imagemUrl">URL da Imagem:</label>
        <input
          id="imagemUrl"
          type="text"
          value={imagemUrl}
          onChange={(e) => setImagemUrl(e.target.value)}
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Cadastrando...' : 'Cadastrar Produto'}
      </button>
    </form>
  );
};

export default CadastroProduto;