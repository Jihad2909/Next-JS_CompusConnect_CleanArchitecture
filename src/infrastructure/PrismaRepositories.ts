import { prisma } from '../lib/prisma';
import {
  HelpOfferEntity,
  HelpRequestEntity,
  IHelpOfferRepository,
  IHelpRequestRepository,
  IReviewRepository,
  RequestFilters,
  RequestStatus,
  ReviewEntity,
} from '../domain/types';

export class PrismaHelpRequestRepository implements IHelpRequestRepository {
  async findAll(filters?: RequestFilters): Promise<HelpRequestEntity[]> {
    const where: any = {};

    if (filters?.subject && filters.subject !== 'ALL') {
      where.subject = filters.subject;
    }
    if (filters?.level && filters.level !== 'ALL') {
      where.level = filters.level;
    }
    if (filters?.status && filters.status !== 'ALL') {
      where.status = filters.status as RequestStatus;
    }
    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return await prisma.helpRequest.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, specialite: true, niveau: true, skills: true } },
        offers: {
          include: {
            helper: { select: { id: true, name: true, specialite: true, niveau: true, skills: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        review: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: number): Promise<HelpRequestEntity | null> {
    return await prisma.helpRequest.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, specialite: true, niveau: true, skills: true } },
        offers: {
          include: {
            helper: { select: { id: true, name: true, specialite: true, niveau: true, skills: true } },
          },
        },
        review: true,
      },
    });
  }

  async findByUserDashboard(userId: number) {
    const published = await prisma.helpRequest.findMany({
      where: { authorId: userId },
      include: {
        offers: { include: { helper: { select: { id: true, name: true, specialite: true, niveau: true, skills: true } } } },
        review: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const offersMade = await prisma.helpOffer.findMany({
      where: { helperId: userId },
      include: {
        request: {
          include: {
            author: { select: { id: true, name: true, specialite: true, niveau: true, skills: true } },
            review: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { published, offersMade };
  }

  async create(data: {
    title: string;
    description: string;
    subject: string;
    level: string;
    availability: string;
    authorId: number;
  }): Promise<HelpRequestEntity> {
    return await prisma.helpRequest.create({ data });
  }

  async updateStatus(id: number, status: RequestStatus): Promise<void> {
    await prisma.helpRequest.update({
      where: { id },
      data: { status },
    });
  }

  async report(id: number): Promise<void> {
    await prisma.helpRequest.update({
      where: { id },
      data: { isReported: true },
    });
  }

  async delete(id: number): Promise<void> {
    await prisma.helpRequest.delete({ where: { id } });
  }
}

export class PrismaHelpOfferRepository implements IHelpOfferRepository {
  async create(data: { requestId: number; helperId: number; message: string }): Promise<HelpOfferEntity> {
    return await prisma.helpOffer.create({ data });
  }

  async findById(id: number): Promise<HelpOfferEntity | null> {
    return await prisma.helpOffer.findUnique({ where: { id } });
  }

  async acceptOffer(offerId: number, requestId: number): Promise<void> {
    // Transaction atomique : accepte l'offre choisie, refuse les autres et passe la demande à AIDE_ACCEPTEE
    await prisma.$transaction([
      prisma.helpOffer.update({ where: { id: offerId }, data: { status: 'ACCEPTEE' } }),
      prisma.helpOffer.updateMany({
        where: { requestId, id: { not: offerId } },
        data: { status: 'REFUSEE' },
      }),
      prisma.helpRequest.update({ where: { id: requestId }, data: { status: 'AIDE_ACCEPTEE' } }),
    ]);
  }

  async rejectOffer(offerId: number): Promise<void> {
    await prisma.helpOffer.update({ where: { id: offerId }, data: { status: 'REFUSEE' } });
  }
}

export class PrismaReviewRepository implements IReviewRepository {
  async create(data: { requestId: number; authorId: number; rating: number; comment: string }): Promise<ReviewEntity> {
    return await prisma.review.create({ data });
  }
}