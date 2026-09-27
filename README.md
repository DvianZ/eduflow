# EduFlow

A modern learning flow management app built for students and lifelong learners, offering an immersive, gamified, and seamless educational experience on iOS, Android, and the Web.

## Features
- **Discovery**: Explore a vast catalog of courses across various topics (Spatial UI, Machine Learning, etc.).
- **Progress Tracking**: Track your streak, earned points, and module-level progress.
- **Mock Checkout**: Seamless, state-driven mock payment experience.
- **Cross-Platform**: Runs beautifully on iOS, Android, and Web browsers.
- **Dark & Light Mode**: Fluid dynamic theming out of the box.

## Tech Stack
- **React Native 0.86.3** + **Expo 57.0.25**
- **Zustand** for global state management
- **Expo Router** for file-based navigation
- **AsyncStorage** for local persistence

## Quick Start
1. Clone the repository
2. Install dependencies: `npm install`
3. Run the development server: `npx expo start`
4. Scan the QR code with Expo Go (iOS/Android) or press `w` to open in your web browser.

## Project Structure
Please see [ARCHITECTURE.md](./ARCHITECTURE.md) for a detailed overview of the folder structure and technical design.

## Development
- `npm run lint` - Run ESLint (when configured)
- `npm run type-check` - Run TypeScript compiler check (use `npx tsc --noEmit`)

## Vision
See [PROJECT_VISION.md](./PROJECT_VISION.md) for more info on the project goals and roadmap.

## License
MIT
