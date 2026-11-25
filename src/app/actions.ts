'use server';

import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '../lib/prisma';
import { createSession, destroySession, getCurrentUser } from '../lib/session';
import {
  PrismaHelpOfferRepository,
  PrismaHelpRequestRepository,
  PrismaReviewRepository,
} from '../infrastructure/PrismaRepositories';
import {
  AcceptHelpOfferUseCase,
  CompleteHelpRequestUseCase,
  CreateHelpRequestUseCase,
  DeleteReportedRequestUseCase,
  ProposeHelpUseCase,
  SubmitReviewUseCase,
} from '../use-cases/HelpUseCases';

const requestRepo = new PrismaHelpRequestRepository();
const offerRepo = new PrismaHelpOfferRepository();
const reviewRepo = new PrismaReviewRepository();

// --- AUTHENTIFICATION ---

export async function registerAction(formData: FormData) {
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');
  const specialite = String(formData.get('specialite') || 'Génie Logiciel').trim();
  const niveau = String(formData.get('niveau') || 'ING 2').trim();
  const skills = String(formData.get('skills') || '').trim();

  if (!name || !email || password.length < 4) {
    return { error: 'Tous les champs sont obligatoires (mot de passe min. 4 caractères).' };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: 'Cet email est déjà utilisé.' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, specialite, niveau, skills },
  });

  await createSession(user.id);
  redirect('/');
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return { error: 'Email ou mot de passe incorrect.' };
  }

  await createSession(user.id);
  redirect('/');
}

export async function logoutAction() {
  await destroySession();
  redirect('/login');
}

// --- DEMANDES & PROPOSITIONS D'AIDE ---

export async function createHelpRequestAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Vous devez être connecté.' };

  try {
    const useCase = new CreateHelpRequestUseCase(requestRepo);
    await useCase.execute({
      title: String(formData.get('title') || ''),
      description: String(formData.get('description') || ''),
      subject: String(formData.get('subject') || ''),
      level: String(formData.get('level') || ''),
      availability: String(formData.get('availability') || ''),
      authorId: user.id,
    });
    revalidatePath('/');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function proposeHelpAction(requestId: number, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Connectez-vous pour proposer votre aide.' };

  try {
    const useCase = new ProposeHelpUseCase(requestRepo, offerRepo);
    await useCase.execute({
      requestId,
      helperId: user.id,
      message: String(formData.get('message') || ''),
    });
    revalidatePath('/');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function acceptOfferAction(requestId: number, offerId: number) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Non autorisé.' };

  try {
    const useCase = new AcceptHelpOfferUseCase(requestRepo, offerRepo);
    await useCase.execute({ requestId, offerId, currentUserId: user.id });
    revalidatePath('/');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function completeRequestAction(requestId: number) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Non autorisé.' };

  try {
    const useCase = new CompleteHelpRequestUseCase(requestRepo);
    await useCase.execute({ requestId, currentUserId: user.id });
    revalidatePath('/');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function submitReviewAction(requestId: number, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Non autorisé.' };

  try {
    const useCase = new SubmitReviewUseCase(requestRepo, reviewRepo);
    await useCase.execute({
      requestId,
      currentUserId: user.id,
      rating: Number(formData.get('rating') || 5),
      comment: String(formData.get('comment') || ''),
    });
    revalidatePath('/');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}

export async function reportRequestAction(requestId: number) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Connectez-vous pour signaler.' };

  await requestRepo.report(requestId);
  revalidatePath('/');
  revalidatePath('/admin');
  return { success: true };
}

export async function deleteReportedRequestAction(requestId: number) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Non autorisé.' };

  try {
    const useCase = new DeleteReportedRequestUseCase(requestRepo);
    await useCase.execute({ requestId, currentUserRole: user.role });
    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (e: any) {
    return { error: e.message };
  }
}