import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('123456', 10);

  // 1. Création de 2 étudiants et 1 admin
  const jihad = await prisma.user.upsert({
    where: { email: 'jihad@campus.tn' },
    update: {},
    create: {
      name: 'Jihad Mazrani',
      email: 'jihad@campus.tn',
      password: passwordHash,
      role: 'STUDENT',
      specialite: 'Génie Logiciel',
      niveau: 'ING 5',
      skills: 'Spring Boot, Next.js, PostgreSQL, Docker',
    },
  });

  const sarra = await prisma.user.upsert({
    where: { email: 'sarra@campus.tn' },
    update: {},
    create: {
      name: 'Med Montassar Essghair',
      email: 'MMS@campus.tn',
      password: passwordHash,
      role: 'STUDENT',
      specialite: 'Data & IA',
      niveau: 'ING 4',
      skills: 'Python, Machine Learning, SQL',
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@campus.tn' },
    update: {},
    create: {
      name: 'Administrateur Campus',
      email: 'admin@campus.tn',
      password: passwordHash,
      role: 'ADMIN',
      specialite: 'Administration',
      niveau: 'Staff',
      skills: 'Modération',
    },
  });

  // 2. Création de demandes d'aide initiales
  await prisma.helpRequest.createMany({
    data: [
      {
        title: 'Comprendre la Clean Architecture sous Next.js',
        description: 'Je bloque sur la séparation entre Use Cases et Prisma Repository pour mon projet.',
        subject: 'Développement Web',
        level: 'ING 5',
        availability: 'Demain 10h - 12h',
        status: 'OUVERTE',
        authorId: sarra.id,
      },
      {
        title: 'Révision requêtes SQL complexes et Jointures',
        description: 'Besoin d’aide pour préparer le TP PostgreSQL de vendredi.',
        subject: 'Base de données',
        level: 'ING 4',
        availability: 'Jeudi après-midi',
        status: 'OUVERTE',
        authorId: jihad.id,
      },
      {
        title: 'Annonce spam hors sujet à vérifier',
        description: 'Contenu signalé pour test de modération admin.',
        subject: 'Autre',
        level: 'L1',
        availability: 'N/A',
        status: 'OUVERTE',
        isReported: true,
        authorId: sarra.id,
      },
    ],
  });

  console.log('Seed CampusConnect exécuté avec succès !');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });