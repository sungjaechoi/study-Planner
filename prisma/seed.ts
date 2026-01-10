import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 기존 블록 데이터 삭제
  await prisma.timeBlock.deleteMany({});
  await prisma.subject.deleteMany({});

  // Create development user
  const user = await prisma.user.upsert({
    where: { id: 'dev-user-001' },
    update: {},
    create: {
      id: 'dev-user-001',
      name: '개발자',
      timezone: 'Asia/Seoul',
    },
  });

  console.log('Created user:', user);

  // Create default planner settings
  const settings = await prisma.plannerSettings.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      gridMinutes: 15,
      dayStartMin: 360, // 6:00 AM
      dayEndMin: 1380, // 11:00 PM
    },
  });

  console.log('Created settings:', settings);

  // Create sample subjects (한글화)
  const subjects = [
    { id: 'subject-math', name: '수학', colorHex: '#3B82F6', sortOrder: 1 },
    { id: 'subject-english', name: '영어', colorHex: '#10B981', sortOrder: 2 },
    { id: 'subject-science', name: '과학', colorHex: '#F59E0B', sortOrder: 3 },
    { id: 'subject-history', name: '역사', colorHex: '#EF4444', sortOrder: 4 },
    { id: 'subject-korean', name: '국어', colorHex: '#8B5CF6', sortOrder: 5 },
  ];

  for (const subjectData of subjects) {
    const subject = await prisma.subject.create({
      data: {
        id: subjectData.id,
        userId: user.id,
        name: subjectData.name,
        colorHex: subjectData.colorHex,
        sortOrder: subjectData.sortOrder,
        isActive: true,
      },
    });
    console.log('Created subject:', subject.name);
  }

  // 학습 블록 템플릿 (한글화)
  const studyTemplates = [
    { subjectId: 'subject-math', titles: ['수학 문제풀이', '수학 개념정리', '수학 오답노트', '미적분 연습', '확률과 통계'] },
    { subjectId: 'subject-english', titles: ['영어 독해', '영어 단어 암기', '영어 문법 정리', '영어 듣기 연습', '영작문 연습'] },
    { subjectId: 'subject-science', titles: ['물리 개념정리', '화학 실험 복습', '생물 암기', '지구과학 문제풀이', '과학 탐구'] },
    { subjectId: 'subject-history', titles: ['한국사 정리', '세계사 연표', '역사 논술', '근현대사 복습', '문화사 학습'] },
    { subjectId: 'subject-korean', titles: ['국어 문학 분석', '국어 비문학 연습', '국어 문법', '고전문학 정리', '현대문학 감상'] },
  ];

  // 1월 10일부터 31일까지 데이터 생성
  let blockCount = 0;

  for (let day = 10; day <= 31; day++) {
    const date = `2026-01-${day.toString().padStart(2, '0')}`;

    // 하루에 3~5개의 계획 블록 생성
    const planCount = 3 + Math.floor(Math.random() * 3);
    const usedSlots: { start: number; end: number }[] = [];

    for (let i = 0; i < planCount; i++) {
      const template = studyTemplates[Math.floor(Math.random() * studyTemplates.length)];
      const title = template.titles[Math.floor(Math.random() * template.titles.length)];

      // 시간 슬롯 생성 (겹치지 않게)
      let startMin: number;
      let endMin: number;
      let attempts = 0;

      do {
        const hour = 8 + Math.floor(Math.random() * 12); // 8시 ~ 20시
        startMin = hour * 60;
        const duration = (1 + Math.floor(Math.random() * 3)) * 30; // 30분 ~ 90분
        endMin = startMin + duration;
        attempts++;
      } while (
        attempts < 10 &&
        usedSlots.some(slot =>
          (startMin >= slot.start && startMin < slot.end) ||
          (endMin > slot.start && endMin <= slot.end) ||
          (startMin <= slot.start && endMin >= slot.end)
        )
      );

      if (attempts < 10) {
        usedSlots.push({ start: startMin, end: endMin });

        blockCount++;
        await prisma.timeBlock.create({
          data: {
            id: `block-plan-${date}-${i}`,
            userId: user.id,
            subjectId: template.subjectId,
            date: date,
            type: 'PLAN',
            isAllDay: false,
            startMin: startMin,
            endMin: endMin,
            title: title,
            displayOrder: i + 1,
          },
        });

        // 70% 확률로 실행 블록 생성 (계획 대비 80~110% 시간)
        if (Math.random() < 0.7) {
          const executionRatio = 0.8 + Math.random() * 0.3;
          const executionDuration = Math.round((endMin - startMin) * executionRatio);
          const executionEndMin = startMin + executionDuration;

          blockCount++;
          await prisma.timeBlock.create({
            data: {
              id: `block-exec-${date}-${i}`,
              userId: user.id,
              subjectId: template.subjectId,
              date: date,
              type: 'EXECUTION',
              isAllDay: false,
              startMin: startMin,
              endMin: executionEndMin,
              title: title,
              displayOrder: i + 1,
            },
          });
        }
      }
    }

    console.log(`Created blocks for ${date}`);
  }

  console.log(`Seed completed! Total blocks: ${blockCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
