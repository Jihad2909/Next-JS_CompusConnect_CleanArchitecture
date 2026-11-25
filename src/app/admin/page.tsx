import { redirect } from 'next/navigation';
import { deleteReportedRequestAction } from '../../app/actions';
import { PrismaHelpRequestRepository } from '../../infrastructure/PrismaRepositories';
import { getCurrentUser } from '../../lib/session';

export default async function AdminPage() {
  const user = await getCurrentUser();

  // Protection stricte de la route côté serveur selon le rôle
  if (!user || user.role !== 'ADMIN') {
    redirect('/');
  }

  const repo = new PrismaHelpRequestRepository();
  const allRequests = await repo.findAll();
  const reportedRequests = allRequests.filter((r) => r.isReported);

  return (
    <div className="space-y-6">
      <div className="bg-rose-950 text-white rounded-xl p-6">
        <h1 className="text-2xl font-bold">Espace Modération Administrateur</h1>
        <p className="text-rose-200 text-sm mt-1">
          Gestion des publications signalées par les étudiants ({reportedRequests.length} signalement(s)).
        </p>
      </div>

      {reportedRequests.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
          Aucune publication signalée à modérer.
        </div>
      ) : (
        <div className="space-y-4">
          {reportedRequests.map((req) => (
            <div
              key={req.id}
              className="bg-white border border-rose-200 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm"
            >
              <div>
                <span className="text-xs font-bold bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded">
                  SIGNALÉE
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{req.title}</h3>
                <p className="text-sm text-slate-600">{req.description}</p>
                <p className="text-xs text-slate-400 mt-1">
                  Auteur : {req.author?.name} • Matière : {req.subject}
                </p>
              </div>

              <form
                action={async () => {
                  'use server';
                  await deleteReportedRequestAction(req.id);
                }}
              >
                <button
                  type="submit"
                  className="bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold px-4 py-2 rounded-lg"
                >
                  Supprimer la publication
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}