import {
  IHelpOfferRepository,
  IHelpRequestRepository,
  IReviewRepository,
  RequestFilters,
} from '../domain/types';

// 1. Récupérer les demandes avec filtres (Matière, Niveau, Statut, Recherche)
export class GetHelpRequestsUseCase {
  constructor(private requestRepo: IHelpRequestRepository) {}

  async execute(filters?: RequestFilters) {
    return await this.requestRepo.findAll(filters);
  }
}

// 2. Publier une nouvelle demande d'aide
export class CreateHelpRequestUseCase {
  constructor(private requestRepo: IHelpRequestRepository) {}

  async execute(input: {
    title: string;
    description: string;
    subject: string;
    level: string;
    availability: string;
    authorId: number;
  }) {
    if (!input.title.trim() || !input.description.trim()) {
      throw new Error('Le titre et la description sont obligatoires.');
    }
    if (!input.subject.trim() || !input.level.trim() || !input.availability.trim()) {
      throw new Error('La matière, le niveau et la disponibilité sont obligatoires.');
    }
    return await this.requestRepo.create(input);
  }
}

// 3. Proposer son aide sur une demande
export class ProposeHelpUseCase {
  constructor(
    private requestRepo: IHelpRequestRepository,
    private offerRepo: IHelpOfferRepository
  ) {}

  async execute(input: { requestId: number; helperId: number; message: string }) {
    if (!input.message.trim()) {
      throw new Error('Veuillez écrire un message pour proposer votre aide.');
    }

    const request = await this.requestRepo.findById(input.requestId);
    if (!request) {
      throw new Error('Demande introuvable.');
    }

    // Règle métier : Une demande clôturée ou déjà prise ne reçoit plus de propositions
    if (request.status !== 'OUVERTE') {
      throw new Error('Cette demande n’accepte plus de propositions.');
    }

    // Règle métier : L'auteur ne peut pas répondre à sa propre demande
    if (request.authorId === input.helperId) {
      throw new Error('Vous ne pouvez pas proposer votre aide sur votre propre demande.');
    }

    return await this.offerRepo.create(input);
  }
}

// 4. Accepter une proposition (Seul l'auteur peut le faire)
export class AcceptHelpOfferUseCase {
  constructor(
    private requestRepo: IHelpRequestRepository,
    private offerRepo: IHelpOfferRepository
  ) {}

  async execute(input: { requestId: number; offerId: number; currentUserId: number }) {
    const request = await this.requestRepo.findById(input.requestId);
    if (!request) throw new Error('Demande introuvable.');

    // Règle métier : Seul l'auteur accepte
    if (request.authorId !== input.currentUserId) {
      throw new Error('Action non autorisée : seul l’auteur peut accepter une proposition.');
    }

    if (request.status !== 'OUVERTE') {
      throw new Error('Une aide a déjà été acceptée ou la demande est terminée.');
    }

    await this.offerRepo.acceptOffer(input.offerId, input.requestId);
  }
}

// 5. Clôturer la séance (AIDE_ACCEPTEE -> TERMINEE)
export class CompleteHelpRequestUseCase {
  constructor(private requestRepo: IHelpRequestRepository) {}

  async execute(input: { requestId: number; currentUserId: number }) {
    const request = await this.requestRepo.findById(input.requestId);
    if (!request) throw new Error('Demande introuvable.');

    if (request.authorId !== input.currentUserId) {
      throw new Error('Seul l’auteur peut clôturer cette demande.');
    }

    if (request.status !== 'AIDE_ACCEPTEE') {
      throw new Error('La demande doit avoir une aide acceptée avant d’être terminée.');
    }

    await this.requestRepo.updateStatus(input.requestId, 'TERMINEE');
  }
}

// 6. Évaluer la séance après clôture
export class SubmitReviewUseCase {
  constructor(
    private requestRepo: IHelpRequestRepository,
    private reviewRepo: IReviewRepository
  ) {}

  async execute(input: { requestId: number; currentUserId: number; rating: number; comment: string }) {
    const request = await this.requestRepo.findById(input.requestId);
    if (!request) throw new Error('Demande introuvable.');

    // Règle métier : Uniquement après clôture
    if (request.status !== 'TERMINEE') {
      throw new Error('L’évaluation est autorisée uniquement après la clôture de la séance.');
    }

    if (request.review) {
      throw new Error('Cette séance a déjà été évaluée.');
    }

    // Règle métier : Uniquement les participants (auteur ou helper accepté)
    const acceptedOffer = request.offers?.find((o) => o.status === 'ACCEPTEE');
    const isParticipant =
      request.authorId === input.currentUserId || acceptedOffer?.helperId === input.currentUserId;

    if (!isParticipant) {
      throw new Error('Seuls les participants de la séance peuvent laisser une évaluation.');
    }

    if (input.rating < 1 || input.rating > 5) {
      throw new Error('La note doit être comprise entre 1 et 5.');
    }

    return await this.reviewRepo.create({
      requestId: input.requestId,
      authorId: input.currentUserId,
      rating: input.rating,
      comment: input.comment.trim() || 'Séance très utile, merci !',
    });
  }
}

// 7. Modération Admin : supprimer une demande signalée
export class DeleteReportedRequestUseCase {
  constructor(private requestRepo: IHelpRequestRepository) {}

  async execute(input: { requestId: number; currentUserRole: string }) {
    if (input.currentUserRole !== 'ADMIN') {
      throw new Error('Accès refusé : réservé aux administrateurs.');
    }
    await this.requestRepo.delete(input.requestId);
  }
}