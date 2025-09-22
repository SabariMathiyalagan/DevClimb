/**
 * Roadmap Context Provider
 * 
 * Database-integrated roadmap state management
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { RoadmapSummaryDB, WeekDetailsDB, ProgressDB } from '@/services/roadmapApi';

// Context State Interface
interface RoadmapContextState {
  // Database-integrated data
  userRoadmaps: RoadmapSummaryDB[];
  currentRoadmapId: number | null;
  currentWeek: WeekDetailsDB | null;
  currentProgress: ProgressDB | null;
  
  // Loading states
  isLoadingRoadmaps: boolean;
  isLoadingWeek: boolean;
  isLoadingProgress: boolean;
  
  // Actions
  setUserRoadmaps: (roadmaps: RoadmapSummaryDB[]) => void;
  setCurrentRoadmapId: (roadmapId: number | null) => void;
  setCurrentWeek: (week: WeekDetailsDB | null) => void;
  setCurrentProgress: (progress: ProgressDB | null) => void;
  
  // Loading state setters
  setIsLoadingRoadmaps: (loading: boolean) => void;
  setIsLoadingWeek: (loading: boolean) => void;
  setIsLoadingProgress: (loading: boolean) => void;
  
  // Utility actions
  clearAllData: () => void;
}

// Create Context
const RoadmapContext = createContext<RoadmapContextState | undefined>(undefined);

// Context Provider Props
interface RoadmapProviderProps {
  children: ReactNode;
}

// Context Provider Component
export const RoadmapProvider: React.FC<RoadmapProviderProps> = ({ children }) => {
  // Database-integrated state
  const [userRoadmaps, setUserRoadmaps] = useState<RoadmapSummaryDB[]>([]);
  const [currentRoadmapId, setCurrentRoadmapId] = useState<number | null>(null);
  const [currentWeek, setCurrentWeek] = useState<WeekDetailsDB | null>(null);
  const [currentProgress, setCurrentProgress] = useState<ProgressDB | null>(null);

  // Loading states
  const [isLoadingRoadmaps, setIsLoadingRoadmaps] = useState<boolean>(false);
  const [isLoadingWeek, setIsLoadingWeek] = useState<boolean>(false);
  const [isLoadingProgress, setIsLoadingProgress] = useState<boolean>(false);

  // Clear all data
  const clearAllData = (): void => {
    setUserRoadmaps([]);
    setCurrentRoadmapId(null);
    setCurrentWeek(null);
    setCurrentProgress(null);
    setIsLoadingRoadmaps(false);
    setIsLoadingWeek(false);
    setIsLoadingProgress(false);
  };

  // Context value
  const contextValue: RoadmapContextState = {
    // Database-integrated data
    userRoadmaps,
    currentRoadmapId,
    currentWeek,
    currentProgress,
    
    // Loading states
    isLoadingRoadmaps,
    isLoadingWeek,
    isLoadingProgress,
    
    // Actions
    setUserRoadmaps,
    setCurrentRoadmapId,
    setCurrentWeek,
    setCurrentProgress,
    
    // Loading state setters
    setIsLoadingRoadmaps,
    setIsLoadingWeek,
    setIsLoadingProgress,
    
    // Utility actions
    clearAllData,
  };

  return (
    <RoadmapContext.Provider value={contextValue}>
      {children}
    </RoadmapContext.Provider>
  );
};

// Custom hook to use roadmap context
export const useRoadmap = (): RoadmapContextState => {
  const context = useContext(RoadmapContext);
  
  if (context === undefined) {
    throw new Error('useRoadmap must be used within a RoadmapProvider');
  }
  
  return context;
};

export default RoadmapContext;

