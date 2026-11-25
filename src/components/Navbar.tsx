import Link from 'next/link';
import { logoutAction } from '../app/actions';

interface NavbarProps {
  user: {
    id: number;
    name: string;
    role: string;
    specialite: string;
    niveau: string;
    skills: string;
  } | null;
}

export default function Navbar({ user }: NavbarProps) {
  return (
    <header className="bg-slate-900 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold tracking-tight text-indigo-400">
            CampusConnect
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium">
            <Link href="/" className="hover:text-indigo-300 transition">
              Demandes d&apos;aide
            </Link>
            {user && (
              <Link href="/dashboard" className="hover:text-indigo-300 transition">
                Mon Tableau de bord
              </Link>
            )}
            {user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="bg-rose-600/20 text-rose-300 border border-rose-500/40 px-2.5 py-1 rounded hover:bg-rose-600/30 transition"
              >
                Espace Admin
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <div className="hidden sm:block text-right">
                <p className="font-semibold text-slate-100">{user.name}</p>
                <p className="text-xs text-slate-400">
                  {user.specialite} • {user.niveau}
                </p>
              </div>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded text-slate-200 border border-slate-700 transition"
                >
                  Déconnexion
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="bg-indigo-600 hover:bg-indigo-500 px-4 py-1.5 rounded font-medium transition"
            >
              Connexion / Inscription
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}