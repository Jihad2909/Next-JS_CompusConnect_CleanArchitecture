import { redirect } from 'next/navigation';
import RequestCard from '../../components/RequestCard';
import { PrismaHelpRequestRepository } from '../../infrastructure/PrismaRepositories';
import { getCurrentUser } from '../../lib/session';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const repo = new PrismaHelpRequestRepository();
  const { published, offersMade } = await repo.findByUserDashboard(user.id);

  const completedSessionsCount =
    published.filter((r) => r.status === 'TERMINEE').length +
    offersMade.filter((o) => o.status === 'ACCEPTEE' && o.request.status === 'TERMINEE').length;

  return (
    <div className="space-y-8">
      {/* Profil & Statistiques */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tableau de bord de {user.name}</h1>
          <p className="text-sm text-slate-600 mt-1">
            {user.specialite} ({user.niveau}) • <strong>Compétences :</strong> {user.skills}
          </p>
        </div>
        <div className="flex gap-4 text-center">
          <div className="bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100">
            <p className="text-xl font-bold text-indigo-700">{published.length}</p>
            <p className="text-xs text-slate-600">Demandes publiées</p>
          </div>
          <div className="bg-amber-50 px-4 py-2 rounded-lg border border-amber-100">
            <p className="text-xl font-bold text-amber-700">{offersMade.length}</p>
            <p className="text-xs text-slate-600">Aides proposées</p>
          </div>
          <div className="bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100">
            <p className="text-xl font-bold text-emerald-700">{completedSessionsCount}</p>
            <p className="text-xs text-slate-600">Séances réalisées</p>
          </div>
        </div>
      </section>

      {/* Mes demandes publiées */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Mes demandes publiées</h2>
        {published.length === 0 ? (
          <p className="text-sm text-slate-500">Vous n&apos;avez publié aucune demande pour le moment.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {published.map((req) => (
              <RequestCard key={req.id} request={req} currentUser={user} />
            ))}
          </div>
        )}
      </section>

      {/* Mes propositions d'aide */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Mes propositions d&apos;aide</h2>
        {offersMade.length === 0 ? (
          <p className="text-sm text-slate-500">Vous n&apos;avez pas encore proposé votre aide.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {offersMade.map((offer) => (
              <div key={offer.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-indigo-700">{offer.request.subject}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100">
                    Offre : {offer.status}
                  </span>
                </div>
                <p className="font-bold text-sm text-slate-900">{offer.request.title}</p>
                <p className="text-xs text-slate-600 mt-1">Votre message : &ldquo;{offer.message}&rdquo;</p>
                <p className="text-xs text-slate-400 mt-2">
                  Statut de la séance : <strong>{offer.request.status}</strong>
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}