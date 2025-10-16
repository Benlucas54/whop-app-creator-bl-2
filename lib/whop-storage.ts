// Whop Storage Service
// This service handles storing and retrieving video experience data using Whop's storage API

interface VideoData {
  id: string;
  title: string;
  url: string;
  duration: string;
  createdAt: string;
}

interface ExperienceData {
  title: string;
  subtitle: string;
  videos: VideoData[];
}

class WhopStorageService {
  private baseUrl = 'https://storage.api.whop.com/api';
  private bucketId = 'video-experience-data';

  // Create or get bucket for storing experience data
  async ensureBucketExists(apiKey: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/buckets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bucket_id: this.bucketId })
      });

      if (!response.ok && response.status !== 409) {
        throw new Error(`Failed to create bucket: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error ensuring bucket exists:', error);
      // Continue anyway - bucket might already exist
    }
  }

  // Save experience data to Whop storage
  async saveExperienceData(
    experienceId: string, 
    data: ExperienceData, 
    apiKey: string
  ): Promise<boolean> {
    try {
      await this.ensureBucketExists(apiKey);

      const fileName = `experience-${experienceId}.json`;
      const fileContent = JSON.stringify(data, null, 2);

      const response = await fetch(`${this.baseUrl}/buckets/${this.bucketId}/upload`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          file_name: fileName,
          content: fileContent,
          content_type: 'application/json'
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to save data: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Error saving experience data:', error);
      return false;
    }
  }

  // Retrieve experience data from Whop storage
  async getExperienceData(
    experienceId: string, 
    apiKey: string
  ): Promise<ExperienceData | null> {
    try {
      const fileName = `experience-${experienceId}.json`;

      const response = await fetch(`${this.baseUrl}/buckets/${this.bucketId}/files/${fileName}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        }
      });

      if (response.status === 404) {
        return null; // File doesn't exist yet
      }

      if (!response.ok) {
        throw new Error(`Failed to retrieve data: ${response.statusText}`);
      }

      const data = await response.json();
      return JSON.parse(data.content || data);
    } catch (error) {
      console.error('Error retrieving experience data:', error);
      return null;
    }
  }

  // Delete experience data from storage
  async deleteExperienceData(
    experienceId: string, 
    apiKey: string
  ): Promise<boolean> {
    try {
      const fileName = `experience-${experienceId}.json`;

      const response = await fetch(`${this.baseUrl}/buckets/${this.bucketId}/files/${fileName}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Error deleting experience data:', error);
      return false;
    }
  }

  // List all experience files (for debugging/admin purposes)
  async listExperienceFiles(apiKey: string): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/buckets/${this.bucketId}/files`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to list files: ${response.statusText}`);
      }

      const data = await response.json();
      return data.files?.map((file: any) => file.name) || [];
    } catch (error) {
      console.error('Error listing experience files:', error);
      return [];
    }
  }
}

export const whopStorage = new WhopStorageService();
export type { ExperienceData, VideoData };
