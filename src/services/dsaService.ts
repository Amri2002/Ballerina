// src/services/dsaService.ts
import { authService } from "./authService";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

export const dsaService = {
	markCompleted: async (
		itemId: string,
		itemType: "lesson" | "challenge"
	): Promise<void> => {
		const token = authService.getToken();
		if (!token) {
			throw new Error("Please log in to save your progress");
		}
		const response = await fetch(`${API_BASE_URL}/dsa/progress/mark-completed`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ itemId, itemType }),
		});
		if (!response.ok) {
			throw new Error(`Failed to mark as completed: ${response.statusText}`);
		}
	},

	getUserProgress: async (): Promise<{
		completedLessons: string[];
		completedChallenges: string[];
	}> => {
		const token = authService.getToken();
		if (!token) {
			return { completedLessons: [], completedChallenges: [] };
		}
		const response = await fetch(`${API_BASE_URL}/dsa/progress/user`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		if (!response.ok) {
			if (response.status === 401) {
				authService.removeToken();
				return { completedLessons: [], completedChallenges: [] };
			}
			throw new Error(`Failed to fetch DSA progress: ${response.statusText}`);
		}
		return response.json();
	},
};
