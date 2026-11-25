'use client';

import { useState } from 'react';
import {
  acceptOfferAction,
  completeRequestAction,
  proposeHelpAction,
  reportRequestAction,
  submitReviewAction,
} from '../app/actions';
import { HelpRequestEntity } from '../domain/types';

interface RequestCardProps {
  request: HelpRequestEntity;
  currentUser: {
    id: number;
    role: string;
    skills: string;
  } | null;
}

export default function RequestCard({ request, currentUser }: RequestCardProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isAuthor = currentUser?.id === request.authorId;
  const acceptedOffer = request.offers?.find((o) => o.status === 'ACCEPTEE');
  const isParticipant = isAuthor || acceptedOffer?.helperId === currentUser?.id;

  // Fonctionnalité originale : Recommandation intelligente basée sur les compétences de l'étudiant
  const userSkillsList = (currentUser?.skills || '')
    .toLowerCase()
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const isRecommended =
    !isAuthor &&
    request.status === 'OUVERTE' &&
    userSkillsList.some(
      (skill) =>
        request.title.toLowerCase().includes(skill) ||
        request.description.toLowerCase().includes(skill) ||
        request.subject.toLowerCase().includes(skill)
    );

  const statusBadge = {
    OUVERTE: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    AIDE_ACCEPTEE: 'bg-amber-100 text-amber-800 border-amber-300',
    TERMINEE: 'bg-slate-200 text-slate-700 border-slate-300',
  }[request.status];

  const statusLabel = {
    OUVERTE: 'Ouverte',
    AIDE_ACCEPTEE: 'Aide acceptée',
    TERMINEE: 'Terminée',
  }[request.status];

  async function handlePropose(formData: FormData) {
    setLoading(true);
    setError(null);
    const res = await proposeHelpAction(request.id, formData);
    if (res?.error) setError(res.error);
    setLoading(false);
  }

  async function handleAccept(offerId: number) {
    setLoading(true);
    setError(null);
    const res = await acceptOfferAction(request.id, offerId);
    if (res?.error) setError(res.error);
    setLoading(false);
  }

  async function handleComplete() {
    setLoading(true);
    setError(null);
    const res = await completeRequestAction(request.id);
    if (res?.error) setError(res.error);
    setLoading(false);
  }

  async function handleReview(formData: FormData) {
    setLoading(true);
    setError(null);
    const res = await submitReviewAction(request.id, formData);
    if (res?.error) setError(res.error);
    setLoading(false);
  }

  return (
    <article className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between gap-4">
      <div>
        {/* En-tête : Badges Matière, Niveau, Statut et Recommandation */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md border border-indigo-200">
              {request.subject}
            </span>
            <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
              Niveau : {request.level}
            </span>
            {isRecommended && (
              <span className="bg-purple-100 text-purple-800 border border-purple-300 px-2.5 py-1 rounded-md">
                Recommandé pour vos compétences
              </span>
            )}
          </div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${statusBadge}`}>
            {statusLabel}
          </span>
        </div>

        {/* Contenu principal */}
        <h3 className="text-lg font-bold text-slate-900 mb-1">{request.title}</h3>
        <p className="text-sm text-slate-600 mb-3">{request.description}</p>

        <div className="text-xs text-slate-500 space-y-1 border-t border-slate-100 pt-2">
          <p>
            <strong>Publié par :</strong> {request.author?.name} ({request.author?.specialite} -{' '}
            {request.author?.niveau})
          </p>
          <p>
            <strong>Disponibilité :</strong> {request.availability}
          </p>
        </div>

        {error && (
          <p className="mt-3 text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2 rounded">
            {error}
          </p>
        )}

        {/* Liste des propositions d'aide */}
        {request.offers && request.offers.length > 0 && (
          <div className="mt-4 bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
            <p className="text-xs font-bold text-slate-700 uppercase">
              Propositions d&apos;aide ({request.offers.length})
            </p>
            {request.offers.map((offer) => (
              <div
                key={offer.id}
                className="bg-white p-2.5 rounded border border-slate-200 flex items-center justify-between gap-2 text-xs"
              >
                <div>
                  <p className="font-semibold text-slate-800">
                    {offer.helper?.name}{' '}
                    <span className="text-slate-400 font-normal">({offer.helper?.skills})</span>
                  </p>
                  <p className="text-slate-600 mt-0.5">{offer.message}</p>
                </div>

                <div>
                  {offer.status === 'ACCEPTEE' && (
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded">
                      Acceptée
                    </span>
                  )}
                  {offer.status === 'REFUSEE' && (
                    <span className="text-slate-400">Refusée</span>
                  )}
                  {offer.status === 'EN_ATTENTE' && isAuthor && request.status === 'OUVERTE' && (
                    <button
                      disabled={loading}
                      onClick={() => handleAccept(offer.id)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded font-medium"
                    >
                      Accepter
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Formulaire pour proposer son aide (uniquement si connecté, non auteur, et demande OUVERTE) */}
        {currentUser && !isAuthor && request.status === 'OUVERTE' && (
          <form action={handlePropose} className="mt-4 flex gap-2">
            <input
              type="text"
              name="message"
              required
              placeholder="Proposer mon aide (ex: Dispo demain à 14h...)"
              className="flex-1 text-xs border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
            />
            <button
              disabled={loading}
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-2 rounded-lg"
            >
              Proposer
            </button>
          </form>
        )}

        {/* Bouton Clôturer la séance (Auteur uniquement, statut AIDE_ACCEPTEE) */}
        {isAuthor && request.status === 'AIDE_ACCEPTEE' && (
          <div className="mt-4">
            <button
              disabled={loading}
              onClick={handleComplete}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2 rounded-lg"
            >
              Marquer la séance comme terminée
            </button>
          </div>
        )}

        {/* Évaluation après clôture (Uniquement participants si pas encore évaluée) */}
        {request.status === 'TERMINEE' && !request.review && isParticipant && (
          <form action={handleReview} className="mt-4 bg-indigo-50/70 p-3 rounded-lg border border-indigo-200 space-y-2">
            <p className="text-xs font-bold text-indigo-900">Évaluer la séance terminée :</p>
            <div className="flex gap-2">
              <select
                name="rating"
                className="text-xs border border-slate-300 rounded px-2 py-1.5 bg-white text-slate-900"
              >
                <option value="5">5 / 5 - Excellent</option>
                <option value="4">4 / 5 - Très bien</option>
                <option value="3">3 / 5 - Bien</option>
                <option value="2">2 / 5 - Moyen</option>
                <option value="1">1 / 5 - Insuffisant</option>
              </select>
              <input
                type="text"
                name="comment"
                required
                placeholder="Votre retour sur la séance..."
                className="flex-1 text-xs border border-slate-300 rounded px-2.5 py-1.5 bg-white text-slate-900"
              />
              <button
                disabled={loading}
                type="submit"
                className="bg-indigo-600 text-white text-xs font-semibold px-3 py-1.5 rounded"
              >
                Noter
              </button>
            </div>
          </form>
        )}

        {/* Affichage de l'évaluation existante */}
        {request.review && (
          <div className="mt-4 bg-amber-50 border border-amber-200 p-2.5 rounded-lg text-xs">
            <p className="font-bold text-amber-900">
              Évaluation de la séance : {request.review.rating}/5 ★
            </p>
            <p className="text-amber-800 italic">&ldquo;{request.review.comment}&rdquo;</p>
          </div>
        )}
      </div>

      {/* Pied de carte : Signaler à l'administrateur */}
      {currentUser && !isAuthor && (
        <div className="flex justify-end pt-2 border-t border-slate-100">
          {request.isReported ? (
            <span className="text-[11px] text-rose-600 font-medium">Signalé à l&apos;admin</span>
          ) : (
            <button
              onClick={() => reportRequestAction(request.id)}
              className="text-[11px] text-slate-400 hover:text-rose-600 transition"
            >
              Signaler cette publication
            </button>
          )}
        </div>
      )}
    </article>
  );
}