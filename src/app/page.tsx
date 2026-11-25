import Link from 'next/link';
import { createHelpRequestAction } from '../app/actions';
import RequestCard from '../components/RequestCard';
import { PrismaHelpRequestRepository } from '../infrastructure/PrismaRepositories';
import { getCurrentUser } from '../lib/session';
import { GetHelpRequestsUseCase } from '../use-cases/HelpUseCases';

interface HomePageProps {
  searchParams: Promise<{
    subject?: string;
    level?: string;
    status?: string;
    search?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const user = await getCurrentUser();

  const repo = new PrismaHelpRequestRepository();
  const getRequests = new GetHelpRequestsUseCase(repo);
  const requests = await getRequests.execute({
    subject: params.subject,
    level: params.level,
    status: params.status,
    search: params.search,
  });

  async function handleCreate(formData: FormData) {
    'use server';
    await createHelpRequestAction(formData);
  }

  return (
    <div className="space-y-8">
      {/* Bannière d'en-tête */}
      <section className="bg-gradient-to-r from-indigo-700 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          Entraide & Séances de Révision
        </h1>
        <p className="text-indigo-100 text-sm sm:text-base max-w-2xl">
          Publiez vos blocages techniques, proposez vos compétences à vos camarades et organisez des séances de révision efficaces.
        </p>
      </section>

      {/* Formulaire de publication (visible uniquement si connecté) */}
      {user ? (
        <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-base font-bold text-slate-900 mb-4">
            Publier une nouvelle demande d&apos;aide
          </h2>
          <form action={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="title"
              required
              placeholder="Titre (ex: Aide sur les jointures SQL ou React Hooks)"
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                name="subject"
                required
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-900"
              >
                <option value="Développement Web">Développement Web</option>
                <option value="Base de données">Base de données</option>
                <option value="Algorithmique">Algorithmique</option>
                <option value="Réseaux & Sécurité">Réseaux & Sécurité</option>
                <option value="Intelligence Artificielle">Intelligence Artificielle</option>
              </select>
              <select
                name="level"
                required
                className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-900"
              >
                <option value="L1">L1</option>
                <option value="L2">L2</option>
                <option value="L3">L3</option>
                <option value="ING 3">ING 3</option>
                <option value="ING 4">ING 4</option>
                <option value="ING 5">ING 5</option>
              </select>
            </div>
            <input
              type="text"
              name="availability"
              required
              placeholder="Disponibilité (ex: Mercredi 15h - 17h ou en ligne)"
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900"
            />
            <input
              type="text"
              name="description"
              required
              placeholder="Décrivez brièvement votre besoin..."
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900"
            />
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-5 py-2 rounded-lg transition"
              >
                Publier la demande
              </button>
            </div>
          </form>
        </section>
      ) : (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center justify-between">
          <p className="text-sm text-indigo-900 font-medium">
            Connectez-vous pour publier une demande ou proposer votre aide.
          </p>
          <Link
            href="/login"
            className="bg-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded-lg"
          >
            Se connecter
          </Link>
        </div>
      )}

      {/* Barre de recherche et filtres (GET via URL searchParams) */}
      <section className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <form method="GET" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <input
            type="text"
            name="search"
            defaultValue={params.search || ''}
            placeholder="Rechercher un mot-clé..."
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 lg:col-span-2"
          />
          <select
            name="subject"
            defaultValue={params.subject || 'ALL'}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-900"
          >
            <option value="ALL">Toutes les matières</option>
            <option value="Développement Web">Développement Web</option>
            <option value="Base de données">Base de données</option>
            <option value="Algorithmique">Algorithmique</option>
            <option value="Réseaux & Sécurité">Réseaux & Sécurité</option>
            <option value="Intelligence Artificielle">Intelligence Artificielle</option>
          </select>
          <select
            name="level"
            defaultValue={params.level || 'ALL'}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-900"
          >
            <option value="ALL">Tous les niveaux</option>
            <option value="L1">L1</option>
            <option value="L2">L2</option>
            <option value="L3">L3</option>
            <option value="ING 3">ING 3</option>
            <option value="ING 4">ING 4</option>
            <option value="ING 5">ING 5</option>
          </select>
          <div className="flex gap-2">
            <select
              name="status"
              defaultValue={params.status || 'ALL'}
              className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-900"
            >
              <option value="ALL">Tous statuts</option>
              <option value="OUVERTE">Ouverte</option>
              <option value="AIDE_ACCEPTEE">Aide acceptée</option>
              <option value="TERMINEE">Terminée</option>
            </select>
            <button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2 rounded-lg"
            >
              Filtrer
            </button>
          </div>
        </form>
      </section>

      {/* Liste des demandes ou état vide */}
      <section>
        {requests.length === 0 ? (
          <div className="text-center py-12 bg-white border border-dashed border-slate-300 rounded-xl">
            <p className="text-slate-500 font-medium">
              Aucune demande d&apos;aide ne correspond à vos critères.
            </p>
            <Link href="/" className="text-indigo-600 text-sm underline mt-2 inline-block">
              Réinitialiser les filtres
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {requests.map((req) => (
              <RequestCard key={req.id} request={req} currentUser={user} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}