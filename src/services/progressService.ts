// src/services/progressService.ts
import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export const progressService = {
  markModuleCompleted: async (moduleId: string): Promise<void> => {
    const token = authService.getToken();
    if (!token) {
      console.error('No authentication token found');
      throw new Error('Please log in to save your progress');
    }

    const response = await fetch(`${API_BASE_URL}/user_progress_mark_completed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ moduleId })
    });

    if (!response.ok) {
      throw new Error(`Failed to mark module as completed: ${response.statusText}`);
    }
  },

  getUserProgress: async (): Promise<{ completedModules: string[] }> => {
    const token = authService.getToken();
    if (!token) {
      console.log('No authentication token found. Returning empty progress.');
      return { completedModules: [] };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/user/progress`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          authService.removeToken();
          return { completedModules: [] };
        }
        throw new Error(`Failed to fetch user progress: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching progress:', error);
      return { completedModules: [] };
    }
  }
};