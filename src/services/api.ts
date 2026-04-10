/**
 * API Service Layer
 * ==================
 * Centralized API client for all backend endpoints.
 * Supports both workflows:
 * - Workflow 1: Dedicated Upload & Analysis
 * - Workflow 2: Chat-Integrated Analysis
 */

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000/api/v1';

// ============================================
// Types
// ============================================

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  attachment?: {
    type: 'image' | 'pdf';
    url: string;
    file_name: string;
    analysis?: any;
  };
}

export interface UploadResult {
  report_id?: string;
  image_id?: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  ocr_text?: string;
  ml_results?: any;
  specialist_type: string;
  status: string;
  created_at: string;
}

export interface AnalysisResult {
  analysis_id: string;
  analysis_text: string;
  diagnosis_summary?: string;
  recommendations: string[];
  confidence_score?: number;
  created_at: string;
}

export interface ConsultationRecord {
  id: string;
  specialist_type: string;
  symptoms?: string;
  report_count: number;
  image_count: number;
  ai_summary?: string;
  created_at: string;
}

// ============================================
// API Client
// ============================================

export const api = {
  // ============================================
  // Chat Endpoints (Workflow 2)
  // ============================================
  chat: {
    send: async (message: string, agentId: string, sessionId?: string): Promise<{ response: string; session_id: string }> => {
      const response = await fetch(`${API_BASE_URL}/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, agent_id: agentId, session_id: sessionId }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Chat request failed');
      }
      
      return response.json();
    },

    sendWithFile: async (
      file: File,
      agentId: string,
      message: string = 'Please analyze this',
      sessionId?: string
    ): Promise<{ response: string; session_id: string; attachment?: any }> => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('agent_id', agentId);
      formData.append('message', message);
      if (sessionId) formData.append('session_id', sessionId);

      const response = await fetch(`${API_BASE_URL}/chat/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'File analysis failed');
      }

      return response.json();
    },

    getAgents: async () => {
      const response = await fetch(`${API_BASE_URL}/chat/agents`);
      return response.json();
    },

    createSession: async () => {
      const response = await fetch(`${API_BASE_URL}/chat/session/new`, { method: 'POST' });
      return response.json();
    },

    getSessionHistory: async (sessionId: string) => {
      const response = await fetch(`${API_BASE_URL}/chat/session/${sessionId}`);
      return response.json();
    },
  },

  // ============================================
  // Report Upload Endpoints (Workflow 1)
  // ============================================
  reports: {
    upload: async (file: File, specialistType: string, userId: string = 'temp-user'): Promise<UploadResult> => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('specialist_type', specialistType);
      formData.append('user_id', userId);

      const response = await fetch(`${API_BASE_URL}/reports/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Upload failed');
      }

      return response.json();
    },

    analyze: async (reportId: string, specialistType: string, symptoms?: string): Promise<AnalysisResult> => {
      const response = await fetch(`${API_BASE_URL}/reports/analyze/${reportId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report_id: reportId, specialist_type: specialistType, symptoms }),
      });

      return response.json();
    },

    get: async (reportId: string) => {
      const response = await fetch(`${API_BASE_URL}/reports/${reportId}`);
      return response.json();
    },
  },

  // ============================================
  // Image Upload Endpoints (Workflow 1)
  // ============================================
  images: {
    upload: async (file: File, imageType: string, specialistType: string, userId: string = 'temp-user'): Promise<UploadResult> => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('image_type', imageType);
      formData.append('specialist_type', specialistType);
      formData.append('user_id', userId);

      const response = await fetch(`${API_BASE_URL}/images/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Image upload failed');
      }

      return response.json();
    },

    get: async (imageId: string) => {
      const response = await fetch(`${API_BASE_URL}/images/${imageId}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to fetch image');
      }
      
      return response.json();
    },

    analyze: async (imageId: string, imageType: string, specialistType: string, symptoms?: string) => {
      const response = await fetch(`${API_BASE_URL}/images/analyze/${imageId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_id: imageId, image_type: imageType, specialist_type: specialistType, symptoms }),
      });

      return response.json();
    },

    capture: async (imageData: string, imageType: string, specialistType: string) => {
      const response = await fetch(`${API_BASE_URL}/images/capture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_data: imageData, image_type: imageType, specialist_type: specialistType }),
      });

      return response.json();
    },
  },

  // ============================================
  // Analysis Endpoints
  // ============================================
  analysis: {
    multimodal: async (
      reportIds: string[],
      imageIds: string[],
      symptoms: string,
      specialistType: string
    ): Promise<AnalysisResult> => {
      const response = await fetch(`${API_BASE_URL}/analysis/multimodal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report_ids: reportIds,
          image_ids: imageIds,
          symptoms,
          specialist_type: specialistType,
        }),
      });

      return response.json();
    },

    generateReport: async (analysisId: string, userName: string) => {
      const response = await fetch(`${API_BASE_URL}/analysis/comprehensive-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis_id: analysisId, user_name: userName }),
      });

      return response.json();
    },
  },

  // ============================================
  // History Endpoints
  // ============================================
  history: {
    getConsultations: async (userId: string, limit = 20): Promise<ConsultationRecord[]> => {
      const response = await fetch(`${API_BASE_URL}/history/consultations?user_id=${userId}&limit=${limit}`);
      return response.json();
    },

    getConsultationDetails: async (consultationId: string) => {
      const response = await fetch(`${API_BASE_URL}/history/consultation/${consultationId}`);
      return response.json();
    },

    getReports: async (userId: string, limit = 20) => {
      const response = await fetch(`${API_BASE_URL}/history/reports?user_id=${userId}&limit=${limit}`);
      return response.json();
    },

    getImages: async (userId: string, limit = 20) => {
      const response = await fetch(`${API_BASE_URL}/history/images?user_id=${userId}&limit=${limit}`);
      return response.json();
    },

    deleteConsultation: async (consultationId: string) => {
      const response = await fetch(`${API_BASE_URL}/history/consultation/${consultationId}`, {
        method: 'DELETE',
      });
      return response.json();
    },
  },

  // ============================================
  // Auth Endpoints
  // ============================================
  auth: {
    signup: async (email: string, password: string, fullName: string) => {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName }),
      });
      return response.json();
    },

    login: async (email: string, password: string) => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return response.json();
    },

    getProfile: async (userId: string) => {
      const response = await fetch(`${API_BASE_URL}/auth/profile?user_id=${userId}`);
      return response.json();
    },

    updateProfile: async (userId: string, profileData: any) => {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, ...profileData }),
      });
      return response.json();
    },

    logout: async (accessToken: string) => {
      const response = await fetch(`${API_BASE_URL}/auth/logout?access_token=${accessToken}`, {
        method: 'POST',
      });
      return response.json();
    },
  },
};
