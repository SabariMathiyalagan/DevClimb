/**
 * Database-Integrated Roadmap API Service
 * 
 * New API service for interacting with PostgreSQL-backed roadmap endpoints
 * Simple and efficient functions for frontend-database interaction
 */

import { API_CONFIG } from '@/config/api.config';

// Hardcoded user ID as requested
const USER_ID = 1;

// API Base URL
const API_BASE_URL = API_CONFIG.BASE_URL;

// New Database-Integrated Types
export interface DailyTaskDB {
  task_id: number;
  day_number: number;
  task_description: string;
  date: string;
  completed: boolean;
}

export interface WeekDetailsDB {
  week_index: number;
  theme: string;
  skills_focus: string[];
  weekly_task: string;
  daily_tasks: DailyTaskDB[];
  completion_rate: number;
}

export interface RoadmapSummaryDB {
  roadmap_id: number;
  target_role: string;
  duration_weeks: number;
  weekly_hours_target: number;
  progress_percentage: number;
  current_week: number;
  generated_at: string;
}

export interface ProgressDB {
  overall_progress: number;
  completed_tasks: number;
  total_tasks: number;
  current_week: number;
}

export interface GenerateAndSaveRequest {
  resume_text: string;
  target_role: string;
  role_id: number;
}

export interface RoadmapCreationResponse {
  roadmap_id: number;
  message: string;
  success: boolean;
}

export interface TaskCompletionRequest {
  completed: boolean;
}

export interface JobStatusResponse {
  job_id: number;
  status: 'in progress' | 'complete' | 'failed';
  roadmap_id?: number;
  message: string;
}

// Role ID mapping (from your database)
export const ROLE_IDS = {
  'Frontend Engineer': 1,
  'Backend Engineer': 2,
  'Full Stack Engineer': 3,
  'Mobile Engineer': 4,
  'Cloud DevOps Engineer': 5,
  'Data Engineering Engineer': 6,
  'ML/AI Engineer': 7,
  'Cybersecurity Engineer': 8,
  'QA Test Automation Engineer': 9,
  'Game Development Engineer': 10,
  'Embedded IoT Engineer': 11,
  'AR/VR/XR Engineer': 12,
  'Database Admin Engineer': 13,
} as const;

// API Error class
export class RoadmapApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'RoadmapApiError';
  }
}

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new RoadmapApiError(
        errorData.detail || `HTTP error! status: ${response.status}`,
        response.status,
        errorData
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof RoadmapApiError) {
      throw error;
    }
    
    throw new RoadmapApiError(
      `API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      undefined,
      error
    );
  }
}

// Helper function to format role names for backend
function formatRoleForBackend(displayRole: string): string {
  return displayRole
    .toLowerCase()
    .replace(/\s+/g, '_')  // Replace spaces with underscores
    .replace(/\//g, '_');  // Replace slashes with underscores
}

// Database-Integrated API Functions
export const roadmapApi = {
  /**
   * Generate roadmap and save to database
   */
  async generateAndSaveRoadmap(
    resumeText: string, 
    targetRole: string
  ): Promise<RoadmapCreationResponse> {
    const roleId = ROLE_IDS[targetRole as keyof typeof ROLE_IDS];
    if (!roleId) {
      throw new RoadmapApiError(`Invalid role: ${targetRole}`);
    }

    // Format role for backend (converts "Full Stack Engineer" to "full_stack_engineer")
    const backendRole = formatRoleForBackend(targetRole);

    const request: GenerateAndSaveRequest = {
      resume_text: resumeText,
      target_role: backendRole,
      role_id: roleId,
    };

    return apiCall<RoadmapCreationResponse>('/generate-roadmap-and-save', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * Get all roadmaps for the user (hardcoded user_id = 1)
   */
  async getUserRoadmaps(): Promise<RoadmapSummaryDB[]> {
    return apiCall<RoadmapSummaryDB[]>(`/users/${USER_ID}/roadmaps`);
  },

  /**
   * Get detailed information for a specific week
   */
  async getWeekDetails(roadmapId: number, weekIndex: number): Promise<WeekDetailsDB> {
    return apiCall<WeekDetailsDB>(`/roadmaps/${roadmapId}/weeks/${weekIndex}`);
  },

  /**
   * Get overall progress for a roadmap
   */
  async getRoadmapProgress(roadmapId: number): Promise<ProgressDB> {
    return apiCall<ProgressDB>(`/roadmaps/${roadmapId}/progress`);
  },

  /**
   * Mark a task as complete or incomplete (optimistic UI)
   */
  async markTaskComplete(taskId: number, completed: boolean): Promise<void> {
    const request: TaskCompletionRequest = { completed };
    
    await apiCall(`/tasks/${taskId}/complete`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  },

  /**
   * Delete a roadmap
   */
  async deleteRoadmap(roadmapId: number): Promise<void> {
    await apiCall(`/roadmaps/${roadmapId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Get job status (for checking roadmap generation progress)
   */
  async getJobStatus(jobId: number): Promise<JobStatusResponse> {
    return apiCall<JobStatusResponse>(`/job/${jobId}`, {
      method: 'GET',
    });
  },

  /**
   * Poll job status until complete
   */
  async pollJobUntilComplete(
    jobId: number,
    onProgress?: (status: string) => void,
    pollInterval: number = 2000,
    maxAttempts: number = 150 // 5 minutes max
  ): Promise<number> {
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        const jobStatus = await this.getJobStatus(jobId);
        
        if (onProgress) {
          onProgress(jobStatus.status);
        }
        
        if (jobStatus.status === 'complete') {
          if (jobStatus.roadmap_id) {
            return jobStatus.roadmap_id;
          } else {
            throw new RoadmapApiError('Job completed but no roadmap_id returned');
          }
        }
        
        if (jobStatus.status === 'failed') {
          throw new RoadmapApiError('Roadmap generation failed');
        }
        
        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        attempts++;
        
      } catch (error) {
        if (attempts >= maxAttempts - 1) {
          throw error;
        }
        // Wait before retry on error
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        attempts++;
      }
    }
    
    throw new RoadmapApiError('Roadmap generation timed out');
  },
};

// Utility functions for working with database roadmap data
export const roadmapDbUtils = {
  /**
   * Format target role for display
   */
  formatTargetRole: (role: string): string => {
    return role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  },

  /**
   * Get role ID from role name
   */
  getRoleId: (roleName: string): number => {
    const roleId = ROLE_IDS[roleName as keyof typeof ROLE_IDS];
    if (!roleId) {
      throw new Error(`Invalid role name: ${roleName}`);
    }
    return roleId;
  },

  /**
   * Calculate days remaining in current week
   */
  getDaysRemainingInWeek: (weekDetails: WeekDetailsDB): number => {
    const completedTasks = weekDetails.daily_tasks.filter(task => task.completed).length;
    return Math.max(0, weekDetails.daily_tasks.length - completedTasks);
  },

  /**
   * Get next incomplete task
   */
  getNextTask: (weekDetails: WeekDetailsDB): DailyTaskDB | null => {
    return weekDetails.daily_tasks.find(task => !task.completed) || null;
  },

  /**
   * Format date for display
   */
  formatDate: (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  },

  /**
   * Get week progress color based on completion rate
   */
  getProgressColor: (completionRate: number): string => {
    if (completionRate >= 0.8) return '#10B981'; // Green
    if (completionRate >= 0.5) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  },

  /**
   * Check if roadmap is completed
   */
  isRoadmapCompleted: (progress: ProgressDB): boolean => {
    return progress.overall_progress >= 100;
  },

  /**
   * Get estimated completion date
   */
  getEstimatedCompletionDate: (
    progress: ProgressDB, 
    weeklyHoursTarget: number
  ): Date => {
    const remainingTasks = progress.total_tasks - progress.completed_tasks;
    const averageTasksPerWeek = progress.total_tasks / 12; // 12 week roadmap
    const remainingWeeks = Math.ceil(remainingTasks / averageTasksPerWeek);
    
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + (remainingWeeks * 7));
    
    return completionDate;
  },
};

export default roadmapApi;
