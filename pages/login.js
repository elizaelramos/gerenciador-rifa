import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    senha: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao fazer login');
      }

      // Salvar usuário no localStorage
      localStorage.setItem('usuario', JSON.stringify(data.usuario));

      // Redirecionar baseado no tipo de usuário
      if (data.usuario.tipo === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/gerenciador/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Layout title="Login" showHeader={false}>
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          {/* Logo/Título */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎫</div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Sistema de Rifas
            </h1>
            <p className="text-blue-100">
              Faça login para acessar o painel
            </p>
          </div>

          {/* Card de Login */}
          <div className="bg-white rounded-lg shadow-2xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input"
                  placeholder="seu@email.com"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="label">Senha</label>
                <input
                  type="password"
                  name="senha"
                  value={formData.senha}
                  onChange={handleChange}
                  className="input"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            {/* Informações de acesso padrão */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-semibold text-blue-900 mb-2">
                🔑 Acesso Administrador Padrão:
              </p>
              <p className="text-xs text-gray-700">
                <strong>Email:</strong> admin@rifa.com<br />
                <strong>Senha:</strong> admin123
              </p>
              <p className="text-xs text-orange-600 mt-2">
                ⚠️ Altere a senha padrão em produção!
              </p>
            </div>
          </div>

          {/* Link para voltar */}
          <div className="text-center mt-6">
            <a href="/" className="text-white hover:text-blue-100">
              ← Voltar para o início
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}
