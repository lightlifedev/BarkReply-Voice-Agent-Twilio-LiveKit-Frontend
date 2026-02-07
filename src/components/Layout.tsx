import { Link } from 'react-router-dom';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center px-4">
          <Link to="/" className="text-lg font-semibold text-slate-800">
            Groomer Voice Agent – Admin
          </Link>
          <nav className="ml-6 flex gap-4">
            <Link to="/" className="text-sm text-slate-600 hover:text-slate-800">
              Dashboard
            </Link>
            <Link to="/voice-test" className="text-sm text-slate-600 hover:text-slate-800">
              Voice test
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-4">{children}</main>
    </div>
  );
}
