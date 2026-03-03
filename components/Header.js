import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function Header() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    return router.pathname === path ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600';
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-md no-print">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-blue-600">🎫 Rifa</div>
            <span className="text-gray-600 text-sm">Sistema de Gerenciamento</span>
          </Link>

          <nav className="hidden md:flex space-x-6">
            <Link href="/" className={isActive('/')}>
              Início
            </Link>
            <Link href="/gerenciador/dashboard" className={isActive('/gerenciador/dashboard')}>
              Painel
            </Link>
            <Link href="/validacao" className={isActive('/validacao')}>
              Validar Bilhete
            </Link>
          </nav>

          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-blue-600 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
            <div className="flex flex-col space-y-4">
              <Link
                href="/"
                className={isActive('/')}
                onClick={closeMobileMenu}
              >
                Início
              </Link>
              <Link
                href="/gerenciador/dashboard"
                className={isActive('/gerenciador/dashboard')}
                onClick={closeMobileMenu}
              >
                Painel
              </Link>
              <Link
                href="/validacao"
                className={isActive('/validacao')}
                onClick={closeMobileMenu}
              >
                Validar Bilhete
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
