import { create } from 'zustand';

interface TourStore {
  isOpen: boolean;
  currentStepIndex: number;
  openTour: (stepIndex?: number) => void;
  closeTour: () => void;
  nextStep: (totalSteps: number) => void;
  prevStep: () => void;
  setStepIndex: (index: number) => void;
}

export const useTourStore = create<TourStore>((set) => ({
  isOpen: false,
  currentStepIndex: 0,
  openTour: (stepIndex = 0) =>
    set({
      isOpen: true,
      currentStepIndex: stepIndex,
    }),
  closeTour: () =>
    set({
      isOpen: false,
      currentStepIndex: 0,
    }),
  nextStep: (totalSteps: number) =>
    set((state) => ({
      currentStepIndex: Math.min(state.currentStepIndex + 1, totalSteps - 1),
    })),
  prevStep: () =>
    set((state) => ({
      currentStepIndex: Math.max(state.currentStepIndex - 1, 0),
    })),
  setStepIndex: (index: number) => set({ currentStepIndex: index }),
}));
