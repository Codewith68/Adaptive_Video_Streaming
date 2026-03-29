import axios from "axios";

export type ProcessingStatus = "COMPLETED" | "PROCESSING" | "FAILED";

export interface Video {
  id: string;
  title: string;
  description: string | null;
  originalFilename: string;
  hlsPath: string;
  playlistUrl: string;
  processingStatus: ProcessingStatus | string;
  createdAt: string;
  updatedAt: string;
  streamPageUrl: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

const apiClient = axios.create({
  baseURL: `${apiBaseUrl}/api/v1`,
});

export const resolveAssetUrl = (assetUrl: string): string => {
  if (!assetUrl) {
    return "";
  }

  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(assetUrl)) {
    return assetUrl;
  }

  return `${apiBaseUrl}${assetUrl.startsWith("/") ? assetUrl : `/${assetUrl}`}`;
};

export const fetchVideos = async (): Promise<Video[]> => {
  const response = await apiClient.get<ApiResponse<Video[]>>("/video");
  return response.data.data;
};

export const fetchVideo = async (videoId: string): Promise<Video> => {
  const response = await apiClient.get<ApiResponse<Video>>(`/video/${videoId}`);
  return response.data.data;
};

export const uploadVideo = async (formData: FormData): Promise<Video> => {
  const response = await apiClient.post<ApiResponse<Video>>(
    "/video/upload",
    formData
  );

  return response.data.data;
};

export const getApiErrorMessage = (
  error: unknown,
  fallbackMessage: string
): string => {
  if (axios.isAxiosError(error)) {
    const apiMessage = error.response?.data?.message;
    if (typeof apiMessage === "string" && apiMessage.trim().length > 0) {
      return apiMessage;
    }
  }

  return fallbackMessage;
};
