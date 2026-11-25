export type Role = 'STUDENT' | 'ADMIN';
export type RequestStatus = 'OUVERTE' | 'AIDE_ACCEPTEE' | 'TERMINEE';
export type OfferStatus = 'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE';

export interface UserEntity {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: Role;
  specialite: string;
  niveau: string;
  skills: string;
}

export interface HelpOfferEntity {
  id: number;
  message: string;
  status: OfferStatus;
  requestId: number;
  helperId: number;
  helper?: { id: number; name: string; specialite: string; niveau: string; skills: string };
  createdAt: Date;
}

export interface ReviewEntity {
  id: number;
  rating: number;
  comment: string;
  requestId: number;
  authorId: number;
  createdAt: Date;
}

export interface HelpRequestEntity {
  id: number;
  title: string;
  description: string;
  subject: string;
  level: string;
  availability: string;
  status: RequestStatus;
  isReported: boolean;
  authorId: number;
  author?: { id: number; name: string; specialite: string; niveau: string; skills: string };
  offers?: HelpOfferEntity[];
  review?: ReviewEntity | null;
  createdAt: Date;
}

// --- CONTRATS REPOSITORIES (Inversion de dépendance) ---

export interface RequestFilters {
  subject?: string;
  level?: string;
  status?: string;
  search?: string;
}

export interface IHelpRequestRepository {
  findAll(filters?: RequestFilters): Promise<HelpRequestEntity[]>;
  findById(id: number): Promise<HelpRequestEntity | null>;
  findByUserDashboard(userId: number): Promise<{
    published: HelpRequestEntity[];
    offersMade: (HelpOfferEntity & { request: HelpRequestEntity })[];
  }>;
  create(data: {
    title: string;
    description: string;
    subject: string;
    level: string;
    availability: string;
    authorId: number;
  }): Promise<HelpRequestEntity>;
  updateStatus(id: number, status: RequestStatus): Promise<void>;
  report(id: number): Promise<void>;
  delete(id: number): Promise<void>;
}

export interface IHelpOfferRepository {
  create(data: { requestId: number; helperId: number; message: string }): Promise<HelpOfferEntity>;
  findById(id: number): Promise<HelpOfferEntity | null>;
  acceptOffer(offerId: number, requestId: number): Promise<void>;
  rejectOffer(offerId: number): Promise<void>;
}

export interface IReviewRepository {
  create(data: { requestId: number; authorId: number; rating: number; comment: string }): Promise<ReviewEntity>;
}