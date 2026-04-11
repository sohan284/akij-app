import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create Users
  const employer = await prisma.user.upsert({
    where: { email: 'employer@akij.com' },
    update: {},
    create: {
      email: 'employer@akij.com',
      password: 'password123',
      role: 'employer',
    },
  })

  const candidate = await prisma.user.upsert({
    where: { email: 'candidate@akij.com' },
    update: {},
    create: {
      email: 'candidate@akij.com',
      password: 'password123',
      role: 'candidate',
    },
  })

  console.log({ employer, candidate })

  // Create an initial Exam
  const initialExam = await prisma.exam.create({
    data: {
      title: 'Senior Frontend Developer Assessment',
      totalCandidates: 100,
      totalSlots: 10,
      questionSets: 1,
      questionType: 'Multiple Choice',
      startTime: new Date(),
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      duration: 60,
      negativeMarking: true,
      questions: {
        create: [
          {
            title: 'What is the primary benefit of React Server Components?',
            type: 'radio',
            options: [
              'Reduced client-side bundle size',
              'Faster client-side routing',
              'Easier state management',
              'Improved CSS-in-JS performance'
            ],
            correctAnswer: 'Reduced client-side bundle size',
          },
          {
            title: 'Which of the following are valid Next.js routing patterns?',
            type: 'checkbox',
            options: [
              'App Router',
              'Pages Router',
              'Static Router',
              'Dynamic Router'
            ],
            correctAnswer: 'App Router,Pages Router',
          },
          {
            title: 'Explain the difference between useMemo and useCallback.',
            type: 'text',
          }
        ]
      },
      candidates: {
        create: [
          {
            name: 'Sample Candidate',
            email: 'candidate@akij.com',
            status: 'pending',
          }
        ]
      }
    }
  })

  console.log('Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
