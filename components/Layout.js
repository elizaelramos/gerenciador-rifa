import Head from 'next/head';
import Header from './Header';

export default function Layout({ children, title = 'Sistema de Rifas', showHeader = true }) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Sistema de Gerenciamento Manual de Rifas" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen flex flex-col">
        {showHeader && <Header />}

        <main className="flex-1">
          {children}
        </main>

        <footer className="bg-gray-800 text-white py-4 text-center text-sm no-print">
          <p>&copy; {new Date().getFullYear()} Sistema de Rifas - Projeto Estratégico</p>
        </footer>
      </div>
    </>
  );
}
