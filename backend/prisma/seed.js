import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.attendance.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.material.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const adminPassword = await bcrypt.hash('admin123', 12);
  const teacherPassword = await bcrypt.hash('teacher123', 12);
  const studentPassword = await bcrypt.hash('student123', 12);

  const admin = await prisma.user.create({
    data: { name: 'Admin User', email: 'admin@lms.com', password: adminPassword, role: 'ADMIN' },
  });

  const teacher1 = await prisma.user.create({
    data: { name: 'Prof. Arjun Sharma', email: 'arjun@lms.com', password: teacherPassword, role: 'TEACHER', xpPoints: 500 },
  });

  const teacher2 = await prisma.user.create({
    data: { name: 'Dr. Priya Nair', email: 'priya@lms.com', password: teacherPassword, role: 'TEACHER', xpPoints: 320 },
  });

  const student1 = await prisma.user.create({
    data: { name: 'Rahul Verma', email: 'rahul@lms.com', password: studentPassword, role: 'STUDENT', xpPoints: 230, streak: 5 },
  });

  const student2 = await prisma.user.create({
    data: { name: 'Ananya Singh', email: 'ananya@lms.com', password: studentPassword, role: 'STUDENT', xpPoints: 180, streak: 3 },
  });

  // Create Courses
  const dsa = await prisma.course.create({
    data: {
      title: 'Data Structures & Algorithms',
      description: 'Master DSA from scratch. Cover arrays, linked lists, trees, graphs, sorting, and dynamic programming with hands-on coding challenges.',
      subject: 'Data Structures',
      monthlyPrice: 499,
      instructorId: teacher1.id,
    },
  });

  const webDev = await prisma.course.create({
    data: {
      title: 'Full-Stack Web Development',
      description: 'Build real-world projects using React, Node.js, Express, and PostgreSQL. Learn REST APIs, authentication, deployment, and more.',
      subject: 'Web Development',
      monthlyPrice: 599,
      instructorId: teacher1.id,
    },
  });

  const os = await prisma.course.create({
    data: {
      title: 'Operating Systems Concepts',
      description: 'Deep dive into process management, memory management, file systems, and concurrency. Prepare for GATE and technical interviews.',
      subject: 'Operating Systems',
      monthlyPrice: 399,
      instructorId: teacher2.id,
    },
  });

  const ml = await prisma.course.create({
    data: {
      title: 'Machine Learning Fundamentals',
      description: 'From linear regression to neural networks. Hands-on Python projects using scikit-learn and TensorFlow.',
      subject: 'Machine Learning',
      monthlyPrice: 699,
      instructorId: teacher2.id,
    },
  });

  const dbms = await prisma.course.create({
    data: {
      title: 'Database Management Systems',
      description: 'SQL, normalization, indexing, transactions, and NoSQL. Build production-ready databases for your projects.',
      subject: 'Databases',
      monthlyPrice: 449,
      instructorId: teacher1.id,
    },
  });

  // Add Materials
  await prisma.material.createMany({
    data: [
      { courseId: dsa.id, title: 'Introduction to Arrays', type: 'VIDEO', sourceUrl: 'https://www.youtube.com/embed/QJNwK2uJyGs', uploaderId: teacher1.id, duration: 45 },
      { courseId: dsa.id, title: 'Linked Lists Deep Dive', type: 'VIDEO', sourceUrl: 'https://www.youtube.com/embed/R9PTBwOzceo', uploaderId: teacher1.id, duration: 60 },
      { courseId: dsa.id, title: 'DSA Cheat Sheet', type: 'PDF', sourceUrl: 'https://drive.google.com/file/d/example/view', uploaderId: teacher1.id },
      { courseId: dsa.id, title: 'Tree Traversal Algorithms', type: 'VIDEO', sourceUrl: 'https://www.youtube.com/embed/BHB0B1jFKQc', uploaderId: teacher1.id, duration: 55 },
      { courseId: webDev.id, title: 'React Hooks Masterclass', type: 'VIDEO', sourceUrl: 'https://www.youtube.com/embed/O6P86uwfdR0', uploaderId: teacher1.id, duration: 90 },
      { courseId: webDev.id, title: 'Node.js REST API', type: 'VIDEO', sourceUrl: 'https://www.youtube.com/embed/ENrzD9HAZK4', uploaderId: teacher1.id, duration: 75 },
      { courseId: webDev.id, title: 'Frontend Reference Guide', type: 'DOCUMENT', sourceUrl: 'https://developer.mozilla.org/en-US/', uploaderId: teacher1.id },
      { courseId: os.id, title: 'Process Scheduling', type: 'VIDEO', sourceUrl: 'https://www.youtube.com/embed/2h3eWaPx8SA', uploaderId: teacher2.id, duration: 50 },
      { courseId: os.id, title: 'Memory Management Notes', type: 'PDF', sourceUrl: 'https://drive.google.com/file/d/example2/view', uploaderId: teacher2.id },
      { courseId: ml.id, title: 'Linear Regression from Scratch', type: 'VIDEO', sourceUrl: 'https://www.youtube.com/embed/nk2CQITm_eo', uploaderId: teacher2.id, duration: 65 },
      { courseId: ml.id, title: 'Neural Networks Introduction', type: 'VIDEO', sourceUrl: 'https://www.youtube.com/embed/aircAruvnKk', uploaderId: teacher2.id, duration: 80 },
    ],
  });

  // Enroll student1 in DSA and Web Dev
  const enrollment1 = await prisma.enrollment.create({
    data: {
      studentId: student1.id,
      courseId: dsa.id,
      paymentStatus: 'ACTIVE',
      lastPaymentDate: new Date(),
      nextPaymentDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      amountPaid: 499,
      transactionId: 'TXN-SEED-001',
    },
  });

  const enrollment2 = await prisma.enrollment.create({
    data: {
      studentId: student1.id,
      courseId: webDev.id,
      paymentStatus: 'ACTIVE',
      lastPaymentDate: new Date(),
      nextPaymentDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      amountPaid: 599,
      transactionId: 'TXN-SEED-002',
    },
  });

  const enrollment3 = await prisma.enrollment.create({
    data: {
      studentId: student2.id,
      courseId: ml.id,
      paymentStatus: 'ACTIVE',
      lastPaymentDate: new Date(),
      nextPaymentDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      amountPaid: 699,
      transactionId: 'TXN-SEED-003',
    },
  });

  // Create attendance records
  await prisma.attendance.createMany({
    data: [
      { studentId: student1.id, courseId: dsa.id, lecturesAttended: 3, totalLectures: 4, progressPercentage: 75 },
      { studentId: student1.id, courseId: webDev.id, lecturesAttended: 2, totalLectures: 3, progressPercentage: 67 },
      { studentId: student2.id, courseId: ml.id, lecturesAttended: 1, totalLectures: 2, progressPercentage: 50 },
    ],
  });

  console.log('✅ Seed complete!');
  console.log('\n📋 Login Credentials:');
  console.log('Admin:   admin@lms.com   / admin123');
  console.log('Teacher: arjun@lms.com   / teacher123');
  console.log('Teacher: priya@lms.com   / teacher123');
  console.log('Student: rahul@lms.com   / student123');
  console.log('Student: ananya@lms.com  / student123');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
