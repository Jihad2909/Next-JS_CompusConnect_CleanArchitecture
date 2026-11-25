import type { Metadata } from 'next';
import './globals.css';
import Navbar from '../components/Navbar';
import { getCurrentUser } from '../lib/session';

export const metadata: Metadata = {
  title: 'CampusConnect | Entraide entre étudiants',
  description: 'Plateforme de partage de compétences et séances de révision',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <html lang="fr">
      <body className="bg-slate-50 text-slate-900 min-h-screen flex flex-col">
        <Navbar user={user} />
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}