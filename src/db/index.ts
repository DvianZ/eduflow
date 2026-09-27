import { type SQLiteDatabase } from 'expo-sqlite';

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  // Turn on foreign keys
  await db.execAsync(`PRAGMA foreign_keys = ON;`);

  // Define schema
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      avatar TEXT
    );

    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      instructor TEXT NOT NULL,
      price REAL NOT NULL,
      original_price REAL,
      thumbnail TEXT NOT NULL,
      duration TEXT NOT NULL,
      level TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      duration TEXT NOT NULL,
      video_url TEXT NOT NULL,
      order_index INTEGER NOT NULL,
      FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      lesson_id INTEGER NOT NULL,
      completed BOOLEAN DEFAULT 0,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE,
      FOREIGN KEY(lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
      UNIQUE(user_id, lesson_id)
    );

    CREATE TABLE IF NOT EXISTS cart (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE,
      UNIQUE(user_id, course_id)
    );

    CREATE TABLE IF NOT EXISTS enrollments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE,
      UNIQUE(user_id, course_id)
    );
  `);

  // Check if we need to seed
  const courseCount = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM courses');
  
  if (courseCount && courseCount.count === 0) {
    // Seed Courses
    await db.execAsync(`
      INSERT INTO courses (title, description, instructor, price, original_price, thumbnail, duration, level) VALUES
      ('Mastering Dynamic Island', 'Learn how to implement interactive and engaging Dynamic Island features in iOS 18 using SwiftUI.', 'Sarah Lin', 79.00, 149.00, 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-oiV3gEvg_3ngqB2ZgQRbH285dl50Jj2Fs2P2vUWFJGRQoU0k0PNzy9fvkLLnbmE2lVomVYhP48auXeUNuydmLwNQZTnW01miNMP_w4BykIc-t8Y23budPy3N8ll1xsaCN8-YqcmkXuVgVQi8oAfDOZARxAyIV5SdAQSLyP0neVvLsiMGYLICYcSFGufPsYppQZABSlIf8j1XJOIGL_0xNGpZJvbR1dvuNn0r_RT9otGQpsuUKX00', '4h 30m', 'Advanced'),
      ('Advanced React Native Animations', 'Create butter-smooth 120fps animations using Reanimated 3 and Gesture Handler.', 'David Chen', 59.00, 99.00, 'https://lh3.googleusercontent.com/aida-public/AB6AXuCFo0tVlM9J9K1a5v8L5X6Z3g_lQ2x4J9X0M3J2K8N4v1Q5V2K3Z4L5M6N7P8Q9R0S1T2U3V4W5X6Y7Z8A9B0C1D2E3F4G5H6I7J8K9L0M1N2P3Q4R5S6T7U8V9W0X1Y2Z3A4B5C6D7E8F9G0H1I2J3K4L5M6N7P8Q9R0S1T2U3V4W5X6Y7Z8', '6h 15m', 'Intermediate'),
      ('UI/UX Fundamentals for Devs', 'Bridge the gap between design and development. Learn typography, spacing, and color theory.', 'Alex Morgan', 49.00, 89.00, 'https://lh3.googleusercontent.com/aida-public/AB6AXuD-oiV3gEvg_3ngqB2ZgQRbH285dl50Jj2Fs2P2vUWFJGRQoU0k0PNzy9fvkLLnbmE2lVomVYhP48auXeUNuydmLwNQZTnW01miNMP_w4BykIc-t8Y23budPy3N8ll1xsaCN8-YqcmkXuVgVQi8oAfDOZARxAyIV5SdAQSLyP0neVvLsiMGYLICYcSFGufPsYppQZABSlIf8j1XJOIGL_0xNGpZJvbR1dvuNn0r_RT9otGQpsuUKX00', '3h 45m', 'Beginner');
    `);

    // Seed Lessons for Course 1 (Dynamic Island)
    await db.execAsync(`
      INSERT INTO lessons (course_id, title, duration, video_url, order_index) VALUES
      (1, 'Introduction to Live Activities', '12:30', 'https://example.com/video1.mp4', 1),
      (1, 'Designing the Compact Presentation', '24:15', 'https://example.com/video2.mp4', 2),
      (1, 'Handling Expanded States', '35:00', 'https://example.com/video3.mp4', 3),
      (1, 'Animations and Transitions', '28:45', 'https://example.com/video4.mp4', 4);
    `);

    // Seed mock user and enrollment
    await db.execAsync(`
      INSERT INTO users (name, email, avatar) VALUES
      ('Marcus Vance', 'marcus@eduflow.app', 'https://lh3.googleusercontent.com/aida/AEtjO1WaHZb7NKm-N9FPGnW28jnYsblH33HsbgLJYMY7q-8Mm3GwDKspdqsW_3iurw9pZ9Qit-OdyBbz2XGXVNy1yMlaQi8wPQLCqj9AciVod62FAT6d46-qLZfpZ7SOScAoB1f6qvEqsyY_NasA5nKJausIBVSNfdtCJOelfNAYMV0LXKd43_7LNjnZxevvcNXQn6EDW089a-zP6zoLCnQBCyF0DqkEIg45iEu824uvs_N0YPHPo_o');
      
      INSERT INTO enrollments (user_id, course_id) VALUES (1, 1);
    `);
  }
}

