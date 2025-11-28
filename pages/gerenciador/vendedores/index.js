import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Vendedores() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [vendedores, setVendedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editandoVendedor, setEditandoVendedor] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
  });

  useEffect(() => {
    const usuarioStorage = localStorage.getItem('usuario');
    if (!usuarioStorage) {
      router.push('/login');
      return;
    }

    const user = JSON.parse(usuarioStorage);
    setUsuario(user);
    carregarVendedores();
  }, [router]);

  const carregarVendedores = async () => {
    try {
      const response = await fetch('/api/vendedores');
      const data = await response.json();
      setVendedores(data.vendedores || []);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar vendedores:', error);
      setLoading(false);
    }
  };

  const formatarTelefone = (valor) => {
    const numeros = valor.replace(/\D/g, '');
    const numeroLimitado = numeros.slice(0, 11);

    if (numeroLimitado.length <= 2) {
      return numeroLimitado;
    } else if (numeroLimitado.length <= 7) {
      return `${numeroLimitado.slice(0, 2)} ${numeroLimitado.slice(2)}`;
    } else if (numeroLimitado.length <= 11) {
      const ddd = numeroLimitado.slice(0, 2);
      const parte1 = numeroLimitado.slice(2, 7);
      const parte2 = numeroLimitado.slice(7);
      return `${ddd} ${parte1}${parte2 ? '-' + parte2 : ''}`;
    }

    return numeroLimitado;
  };

  const validarTelefone = (telefone) => {
    const numeros = telefone.replace(/\D/g, '');

    if (numeros.length !== 10 && numeros.length !== 11) {
      return false;
    }

    const ddd = parseInt(numeros.slice(0, 2));
    if (ddd < 11 || ddd > 99) {
      return false;
    }

    return true;
  };

  const handleTelefoneChange = (e) => {
    const valorFormatado = formatarTelefone(e.target.value);
    setFormData({ ...formData, telefone: valorFormatado });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarTelefone(formData.telefone)) {
      alert('Telefone inválido! Use o formato: DD XXXXX-XXXX (ex: 67 98129-7591)');
      return;
    }

    setLoading(true);

    try {
      const url = editandoVendedor
        ? `/api/vendedores/${editandoVendedor.id}`
        : '/api/vendedores';

      const method = editandoVendedor ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        setShowModal(false);
        setEditandoVendedor(null);
        setFormData({ nome: '', telefone: '' });
        carregarVendedores();
      } else {
        alert(data.error || 'Erro ao salvar vendedor');
        setLoading(false);
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao salvar vendedor');
      setLoading(false);
    }
  };

  const handleEditar = (vendedor) => {
    setEditandoVendedor(vendedor);
    setFormData({
      nome: vendedor.nome,
      telefone: vendedor.telefone,
    });
    setShowModal(true);
  };

  const handleDesativar = async (vendedorId) => {
    if (!confirm('Deseja realmente desativar este vendedor?')) return;

    try {
      const response = await fetch(`/api/vendedores/${vendedorId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        carregarVendedores();
      } else {
        alert(data.error || 'Erro ao desativar vendedor');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao desativar vendedor');
    }
  };

  const abrirModalNovo = () => {
    setEditandoVendedor(null);
    setFormData({ nome: '', telefone: '' });
    setShowModal(true);
  };

  if (!usuario) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Vendedores</h1>
            <p className="text-gray-600 mt-1">Gerencie seus vendedores cadastrados</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={abrirModalNovo}
              className="btn btn-primary"
            >
              + Novo Vendedor
            </button>
            <button
              onClick={() => router.back()}
              className="btn btn-secondary"
            >
              ← Voltar
            </button>
          </div>
        </div>

        {/* Lista de Vendedores */}
        {loading ? (
          <div className="text-center py-12">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando vendedores...</p>
          </div>
        ) : vendedores.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600 text-lg mb-4">Nenhum vendedor cadastrado</p>
            <button onClick={abrirModalNovo} className="btn btn-primary">
              Cadastrar Primeiro Vendedor
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendedores.map((vendedor) => (
              <div
                key={vendedor.id}
                className={`card ${!vendedor.ativo ? 'opacity-50 bg-gray-100' : ''}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-2xl">👤</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{vendedor.nome}</h3>
                      <p className="text-sm text-gray-600">{vendedor.telefone}</p>
                    </div>
                  </div>
                  {!vendedor.ativo && (
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                      Inativo
                    </span>
                  )}
                </div>

                {vendedor.bloco_numero && (
                  <div className="mb-3 p-2 bg-blue-50 rounded text-sm">
                    <p className="text-gray-700">
                      <strong>Bloco:</strong> #{vendedor.bloco_numero}
                    </p>
                    {vendedor.rifa_titulo && (
                      <p className="text-gray-600 text-xs mt-1">
                        Rifa: {vendedor.rifa_titulo}
                      </p>
                    )}
                  </div>
                )}

                <div className="text-xs text-gray-500 mb-3">
                  Cadastrado em: {new Date(vendedor.data_cadastro).toLocaleDateString('pt-BR')}
                </div>

                {vendedor.ativo && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditar(vendedor)}
                      className="btn btn-secondary flex-1 text-sm"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDesativar(vendedor.id)}
                      className="btn bg-red-500 text-white hover:bg-red-600 flex-1 text-sm"
                    >
                      Desativar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Modal de Cadastro/Edição */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editandoVendedor ? 'Editar Vendedor' : 'Novo Vendedor'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Nome Completo *</label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="input"
                    placeholder="Digite o nome do vendedor"
                    required
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="label">Telefone/WhatsApp *</label>
                  <input
                    type="tel"
                    value={formData.telefone}
                    onChange={handleTelefoneChange}
                    className="input"
                    placeholder="67 98129-7591"
                    required
                    disabled={loading}
                    maxLength={14}
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Digite apenas números. Formato: DD XXXXX-XXXX
                  </p>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="btn btn-primary flex-1"
                    disabled={loading}
                  >
                    {loading ? 'Salvando...' : 'Salvar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditandoVendedor(null);
                      setFormData({ nome: '', telefone: '' });
                    }}
                    className="btn btn-secondary flex-1"
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3498db;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
