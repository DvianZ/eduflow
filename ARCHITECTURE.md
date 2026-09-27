# Architecture Overview

## Directory Structure
The project follows a standard Expo Router setup with a clear separation of concerns.

```
src/
├── app/              # Expo Router routes (screens)
│   ├── (tabs)/       # Bottom tab navigator screens
│   ├── course/       # Dynamic course details screen
│   ├── lesson/       # Dynamic lesson player screen
│   ├── quiz/         # Dynamic quiz screen
│   └── ...           # Other screens (checkout, onboarding, etc.)
├── components/       # Reusable UI components
├── constants/        # Design tokens (Colors, Typography, Spacing)
├── context/          # Context providers (e.g. SQLite DB provider)
├── data/             # Static mock data sources
├── hooks/            # Custom React hooks (e.g. use-theme)
├── store/            # Zustand global state stores
├── types/            # TypeScript type declarations
└── db/               # Local database schema and migrations
```

## State Management
We use **Zustand** (`src/store/useAppStore.ts`) for managing global application state:
- **User Data**: Points, streak, certificates, pro status.
- **Learning State**: Enrolled courses, course progress, completed lessons, completed quizzes.
- **Reactivity**: Any component reading from the store re-renders automatically when actions like `addPoints` or `enrollInCourse` are triggered.

## Data Storage
- **Mock Data**: Currently, courses, lessons, and quizzes are stored statically in `src/data/mockDatabase.ts`.
- **Persistence**: Zustand is configured with `zustand/middleware` `persist` backing onto `@react-native-async-storage/async-storage`. User progress persists across app restarts.
- **SQLite**: A provider exists (`src/context/DatabaseProvider.tsx`) ready for local-first structured storage in the future.

## Component Hierarchy
- UI logic is strictly separated from business logic. Components trigger actions from the store, and read state from the store.
- We use a custom hook `useTheme()` to supply colors and typography sizes directly to the StyleSheet inline arrays, allowing instant Dark/Light mode switching.

## Navigation
**Expo Router** handles all routing:
- Static routes (e.g., `/checkout`, `/onboarding`).
- Dynamic routes (e.g., `/course/[id]`, `/lesson/[id]`) reading parameters via `useLocalSearchParams()`.
