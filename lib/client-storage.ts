// Client-side storage utilities for video experience data
// This provides a clean interface for the React components to interact with storage

import type { ExperienceData, VideoData } from './whop-storage';

interface StorageResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class ClientStorageService {
  private baseUrl = '/api/experience-data';

  // Load experience data from server
  async loadExperienceData(experienceId: string): Promise<ExperienceData | null> {
    try {
      const response = await fetch(`${this.baseUrl}?experienceId=${experienceId}`);
      
      if (!response.ok) {
        if (response.status === 403) {
          console.warn('Access denied when loading experience data');
          return null;
        }
        throw new Error(`Failed to load data: ${response.statusText}`);
      }

      const data: ExperienceData = await response.json();
      return data;
    } catch (error) {
      console.error('Error loading experience data:', error);
      return null;
    }
  }

  // Save experience data to server
  async saveExperienceData(
    experienceId: string, 
    data: ExperienceData
  ): Promise<StorageResponse<ExperienceData>> {
    try {
      const response = await fetch(`${this.baseUrl}?experienceId=${experienceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Failed to save data'
        };
      }

      return {
        success: true,
        data: result.data || data
      };
    } catch (error) {
      console.error('Error saving experience data:', error);
      return {
        success: false,
        error: 'Network error while saving'
      };
    }
  }

  // Delete experience data (admin only)
  async deleteExperienceData(experienceId: string): Promise<StorageResponse<void>> {
    try {
      const response = await fetch(`${this.baseUrl}/admin?experienceId=${experienceId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Failed to delete data'
        };
      }

      return {
        success: true
      };
    } catch (error) {
      console.error('Error deleting experience data:', error);
      return {
        success: false,
        error: 'Network error while deleting'
      };
    }
  }

  // List all stored experience files (admin only)
  async listStoredFiles(experienceId: string): Promise<StorageResponse<string[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/admin?experienceId=${experienceId}`);
      
      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Failed to list files'
        };
      }

      return {
        success: true,
        data: result.files || []
      };
    } catch (error) {
      console.error('Error listing stored files:', error);
      return {
        success: false,
        error: 'Network error while listing files'
      };
    }
  }

  // Utility function to create default experience data
  createDefaultData(): ExperienceData {
    return {
      title: 'Welcome to Your Video Experience',
      subtitle: 'Share, react, and engage with videos like never before',
      videos: [
        {
          id: '1',
          title: 'Introduction to Whop',
          url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          duration: '3:32',
          createdAt: new Date('2024-01-15').toISOString(),
        },
        {
          id: '2',
          title: 'Getting Started with Next.js',
          url: 'https://www.youtube.com/embed/DGQwd1_Apzc',
          duration: '10:45',
          createdAt: new Date('2024-02-20').toISOString(),
        },
        {
          id: '3',
          title: 'Tailwind CSS Basics',
          url: 'https://www.youtube.com/embed/pfaSUYaSgRo',
          duration: '7:18',
          createdAt: new Date('2024-03-01').toISOString(),
        },
      ],
    };
  }

  // Utility function to validate experience data
  validateExperienceData(data: any): data is ExperienceData {
    return (
      data &&
      typeof data.title === 'string' &&
      typeof data.subtitle === 'string' &&
      Array.isArray(data.videos) &&
      data.videos.every((video: any) => 
        typeof video.id === 'string' &&
        typeof video.title === 'string' &&
        typeof video.url === 'string' &&
        typeof video.duration === 'string' &&
        typeof video.createdAt === 'string'
      )
    );
  }
}

export const clientStorage = new ClientStorageService();
export type { StorageResponse };
