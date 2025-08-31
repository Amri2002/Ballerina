// DSA progress tracking service
import axios from 'axios';
import { authService } from './authService';

const API_BASE = '/api';

export const dsaService = {
  async getUserProgress() {
    try {
      const token = authService.getToken();
      const res = await axios.get(`${API_BASE}/dsa/progress`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });
      // Expecting { completedModules: string[] }
      return res.data;
    } catch (error) {
      console.error('Failed to fetch DSA progress:', error);
      return { completedModules: [] };
    }
  },

  async markModuleCompleted(moduleId: string) {
    try {
      const token = authService.getToken();
      await axios.post(`${API_BASE}/dsa_progress_mark_completed`, { moduleId }, {
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });
      return true;
    } catch (error) {
      console.error('Failed to mark DSA module completed:', error);
      return false;
    }
  }
};
