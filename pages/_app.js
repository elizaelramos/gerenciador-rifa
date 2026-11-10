import { useEffect } from 'react';
import '../styles/globals.css';

/**
 * Se o usuário achava estar logado (localStorage) mas o servidor responde 401
 * (sessão expirada ou login feito antes do cookie de sessão existir),
 * limpa o login local e volta para a tela de login.
 */
function useRedirecionarSessaoExpirada() {
  useEffect(() => {
    if (window.__fetchSessaoInstalado) return;
    window.__fetchSessaoInstalado = true;

    const fetchOriginal = window.fetch.bind(window);
    window.fetch = async (input, init) => {
      const resposta = await fetchOriginal(input, init);
      const url = typeof input === 'string' ? input : input?.url || '';
      if (
        resposta.status === 401 &&
        url.startsWith('/api/') &&
        !url.startsWith('/api/auth/') &&
        localStorage.getItem('usuario')
      ) {
        localStorage.removeItem('usuario');
        window.location.href = '/login';
      }
      return resposta;
    };
  }, []);
}

function MyApp({ Component, pageProps }) {
  useRedirecionarSessaoExpirada();
  return <Component {...pageProps} />;
}

export default MyApp;
