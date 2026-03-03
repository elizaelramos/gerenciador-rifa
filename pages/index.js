import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Link from 'next/link';
import { formatarData } from '../lib/formatters';

export default function Home() {
  const [rifas, setRifas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    // Verificar se está logado
    const usuarioStorage = localStorage.getItem('usuario');
    if (usuarioStorage) {
      setUsuario(JSON.parse(usuarioStorage));
    }
  }, []);

  useEffect(() => {
    async function fetchRifas() {
      try {
        const response = await fetch('/api/rifas');
        const data = await response.json();

        if (response.ok) {
          setRifas(data.rifas || []);
        } else {
          console.error('Erro ao buscar rifas:', data.error);
        }
      } catch (error) {
        console.error('Erro ao conectar com a API:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRifas();
  }, []);

  // Filtrar rifas para exibição
  const rifasExibidas = rifas.filter(rifa => {
    // Se estiver logado, mostra tudo
    if (usuario) return true;

    // Se não estiver logado, esconde as em preparação
    return rifa.status !== 'preparacao';
  });

  if (loading) {
    return (
      <Layout title="Carregando...">
        <div className="flex items-center justify-center min-h-screen">
          <div className="spinner"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Sistema de Rifas - Início">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-xl p-8 mb-8 text-white">
          <h1 className="text-4xl font-bold mb-4">Sistema de Gerenciamento de Rifas</h1>
          <p className="text-lg mb-6">
            Gerencie suas rifas de forma profissional e transparente.
            Sorteios baseados na Loteria Federal com total segurança.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/gerenciador/dashboard" className="btn bg-white text-blue-600 hover:bg-gray-100">
              Acessar Painel
            </Link>

          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="card">
            <div className="text-4xl mb-3">🎲</div>
            <h3 className="text-xl font-bold mb-2">Sorteio Justo</h3>
            <p className="text-gray-600">
              Baseado na Loteria Federal com sistema de número mais próximo automático
            </p>
          </div>

          <div className="card">
            <div className="text-4xl mb-3">📱</div>
            <h3 className="text-xl font-bold mb-2">QR Code Duplo</h3>
            <p className="text-gray-600">
              Validação para comprador e registro simplificado para vendedor
            </p>
          </div>

          <div className="card">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-xl font-bold mb-2">Gestão Completa</h3>
            <p className="text-gray-600">
              Controle de vendas, acerto de contas e estatísticas em tempo real
            </p>
          </div>
        </div>

        {/* Rifas Ativas */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Rifas Ativas</h2>

          {rifasExibidas.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-500 text-lg">Nenhuma rifa ativa no momento</p>
              <Link href="/gerenciador/dashboard" className="btn btn-primary mt-4 inline-block">
                Criar Nova Rifa
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {rifasExibidas.map(rifa => (
                <div key={rifa.id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold">{rifa.titulo}</h3>
                    <span className="badge bg-blue-100 text-blue-800">
                      {rifa.status === 'preparacao' ? 'Em Preparação' : rifa.status}
                    </span>
                  </div>

                  <p className="text-gray-600 mb-4">{rifa.descricao}</p>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500">Data do Sorteio:</span>
                      <p className="font-semibold">
                        {formatarData(rifa.data_sorteio)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Valor do Bilhete:</span>
                      <p className="font-semibold">
                        R$ {parseFloat(rifa.valor_bilhete).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/rifa/${rifa.slug || rifa.id}`}
                      className="btn btn-primary flex-1 text-center"
                    >
                      Ver Detalhes
                    </Link>
                    <Link
                      href={`/validacao?rifaId=${rifa.slug || rifa.id}`}
                      className="btn btn-secondary text-center"
                    >
                      Validar
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Como Funciona */}
        <div className="mt-12 card bg-gray-50">
          <h2 className="text-2xl font-bold mb-6">Como Funciona</h2>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold mb-1">Criação da Rifa</h4>
                <p className="text-gray-600">
                  O gerenciador cria a rifa definindo prêmios, quantidade de bilhetes e blocos
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold mb-1">Distribuição de Blocos</h4>
                <p className="text-gray-600">
                  Os blocos são impressos e distribuídos para os vendedores
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold mb-1">Venda dos Bilhetes</h4>
                <p className="text-gray-600">
                  Vendedores registram compradores via QR Code de forma rápida e simples
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                4
              </div>
              <div>
                <h4 className="font-semibold mb-1">Sorteio</h4>
                <p className="text-gray-600">
                  Na data marcada, o resultado da Loteria Federal define o ganhador automaticamente
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-bold">
                5
              </div>
              <div>
                <h4 className="font-semibold mb-1">Divulgação</h4>
                <p className="text-gray-600">
                  Resultados ficam disponíveis para validação via QR Code com total transparência
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
