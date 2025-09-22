/**
 * Database-Integrated Roadmap Hook
 * 
 * Custom hook for managing database-integrated roadmap operations
 * Simple and efficient functions for component-database interaction
 */

import { useCallback } from 'react';
import { useRoadmap } from '@/context/RoadmapContext';
import { roadmapApi, RoadmapApiError } from '@/services/roadmapApi';

export const useRoadmapDB = () => {
  const {
    // Database state
    userRoadmaps,
    currentRoadmapId,
    currentWeek,
    currentProgress,
    
    // Loading states
    isLoadingRoadmaps,
    isLoadingWeek,
    isLoadingProgress,
    
    // Setters
    setUserRoadmaps,
    setCurrentRoadmapId,
    setCurrentWeek,
    setCurrentProgress,
    setIsLoadingRoadmaps,
    setIsLoadingWeek,
    setIsLoadingProgress,
    
    // Utility
    clearAllData,
  } = useRoadmap();

  // Load user's roadmaps
  const loadUserRoadmaps = useCallback(async () => {
    setIsLoadingRoadmaps(true);
    try {
      const roadmaps = await roadmapApi.getUserRoadmaps();
      setUserRoadmaps(roadmaps);
      
      // Auto-select first roadmap if none selected
      if (roadmaps.length > 0 && !currentRoadmapId) {
        setCurrentRoadmapId(roadmaps[0].roadmap_id);
      }
    } catch (error) {
      console.error('Failed to load roadmaps:', error);
      throw error;
    } finally {
      setIsLoadingRoadmaps(false);
    }
  }, [currentRoadmapId]);

  // Load specific week details
  const loadWeekDetails = useCallback(async (roadmapId: number, weekIndex: number) => {
    setIsLoadingWeek(true);
    try {
      const weekDetails = await roadmapApi.getWeekDetails(roadmapId, weekIndex);
      setCurrentWeek(weekDetails);
    } catch (error) {
      console.error('Failed to load week details:', error);
      throw error;
    } finally {
      setIsLoadingWeek(false);
    }
  }, []);

  // Load roadmap progress
  const loadProgress = useCallback(async (roadmapId: number) => {
    setIsLoadingProgress(true);
    try {
      const progress = await roadmapApi.getRoadmapProgress(roadmapId);
      setCurrentProgress(progress);
    } catch (error) {
      console.error('Failed to load progress:', error);
      throw error;
    } finally {
      setIsLoadingProgress(false);
    }
  }, []);

  // Mark task complete with optimistic UI
  const markTaskComplete = useCallback(async (taskId: number, completed: boolean) => {
    // Optimistic UI update
    if (currentWeek) {
      const updatedTasks = currentWeek.daily_tasks.map(task =>
        task.task_id === taskId ? { ...task, completed } : task
      );
      
      const completedCount = updatedTasks.filter(task => task.completed).length;
      const completionRate = completedCount / updatedTasks.length;
      
      setCurrentWeek({
        ...currentWeek,
        daily_tasks: updatedTasks,
        completion_rate: completionRate,
      });
    }

    try {
      await roadmapApi.markTaskComplete(taskId, completed);
      
      // Refresh progress after task completion
      if (currentRoadmapId) {
        await loadProgress(currentRoadmapId);
      }
    } catch (error) {
      console.error('Failed to mark task complete:', error);
      
      // Revert optimistic update on error
      if (currentWeek) {
        const revertedTasks = currentWeek.daily_tasks.map(task =>
          task.task_id === taskId ? { ...task, completed: !completed } : task
        );
        
        const completedCount = revertedTasks.filter(task => task.completed).length;
        const completionRate = completedCount / revertedTasks.length;
        
        setCurrentWeek({
          ...currentWeek,
          daily_tasks: revertedTasks,
          completion_rate: completionRate,
        });
      }
      
      throw error;
    }
  }, [currentWeek, currentRoadmapId, loadProgress]);

  // Select roadmap (set as current)
  const selectRoadmap = useCallback(async (roadmapId: number) => {
    setCurrentRoadmapId(roadmapId);
    
    // Load progress for selected roadmap
    try {
      await loadProgress(roadmapId);
    } catch (error) {
      console.error('Failed to load progress for selected roadmap:', error);
    }
  }, [loadProgress]);

  // Generate new roadmap and save to database
  const generateRoadmap = useCallback(async (
    resumeText: string, 
    targetRole: string,
    onProgress?: (status: string) => void
  ) => {
    try {
      // Start roadmap generation and get job ID
      const response = await roadmapApi.generateAndSaveRoadmap(resumeText, targetRole);
      const jobId = response.roadmap_id; // This is actually the job_id
      
      console.log('Roadmap generation initiated with job ID:', jobId);
      
      if (onProgress) {
        onProgress('Roadmap generation started...');
      }
      
      // Poll until completion
      const roadmapId = await roadmapApi.pollJobUntilComplete(
        jobId,
        (status) => {
          if (onProgress) {
            const statusMessages: Record<string, string> = {
              'in progress': 'Generating your personalized roadmap...',
              'complete': 'Roadmap generated successfully!',
              'failed': 'Roadmap generation failed'
            };
            onProgress(statusMessages[status] || status);
          }
        }
      );
      
      console.log('Roadmap generation completed with roadmap ID:', roadmapId);
      
      // Refresh roadmaps list after generation
      await loadUserRoadmaps();
      
      // Auto-select the new roadmap
      if (roadmapId) {
        await selectRoadmap(roadmapId);
      }
      
      return { ...response, roadmap_id: roadmapId };
    } catch (error) {
      console.error('Failed to generate roadmap:', error);
      throw error;
    }
  }, [loadUserRoadmaps, selectRoadmap]);

  // Delete roadmap
  const deleteRoadmap = useCallback(async (roadmapId: number) => {
    try {
      await roadmapApi.deleteRoadmap(roadmapId);
      
      // Remove from local state
      const updatedRoadmaps = userRoadmaps.filter(rm => rm.roadmap_id !== roadmapId);
      setUserRoadmaps(updatedRoadmaps);
      
      // Clear current roadmap if it was deleted
      if (currentRoadmapId === roadmapId) {
        setCurrentRoadmapId(updatedRoadmaps.length > 0 ? updatedRoadmaps[0].roadmap_id : null);
        setCurrentWeek(null);
        setCurrentProgress(null);
      }
    } catch (error) {
      console.error('Failed to delete roadmap:', error);
      throw error;
    }
  }, [userRoadmaps, currentRoadmapId]);

  // Load current week for selected roadmap
  const loadCurrentWeek = useCallback(async () => {
    if (!currentRoadmapId || !currentProgress) return;
    
    try {
      await loadWeekDetails(currentRoadmapId, currentProgress.current_week);
    } catch (error) {
      console.error('Failed to load current week:', error);
      throw error;
    }
  }, [currentRoadmapId, currentProgress, loadWeekDetails]);

  // Navigate to specific week
  const navigateToWeek = useCallback(async (weekIndex: number) => {
    if (!currentRoadmapId) return;
    
    try {
      await loadWeekDetails(currentRoadmapId, weekIndex);
    } catch (error) {
      console.error('Failed to navigate to week:', error);
      throw error;
    }
  }, [currentRoadmapId, loadWeekDetails]);

  return {
    // State
    userRoadmaps,
    currentRoadmapId,
    currentWeek,
    currentProgress,
    
    // Loading states
    isLoadingRoadmaps,
    isLoadingWeek,
    isLoadingProgress,
    
    // Actions
    loadUserRoadmaps,
    loadWeekDetails,
    loadProgress,
    markTaskComplete,
    generateRoadmap,
    deleteRoadmap,
    selectRoadmap,
    loadCurrentWeek,
    navigateToWeek,
    clearAllData,
  };
};
