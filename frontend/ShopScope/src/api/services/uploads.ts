import { uploadApi } from '../client';

export interface UploadResult {
  size: number;
  echoedFields: string[];
  echoedFiles: string[];
}

export interface UploadOptions {
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
}

export async function uploadFile(file: File, { onProgress, signal }: UploadOptions = {}): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await uploadApi.post<{ files?: Record<string, string>; form?: Record<string, string> }>(
    '/post',
    formData,
    {
      signal,
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress?.(percent);
        }
      },
    },
  );

  return {
    size: file.size,
    echoedFields: Object.keys(response.data?.form ?? {}),
    echoedFiles: Object.keys(response.data?.files ?? {}),
  };
}