import 'axios';


declare module 'axios' {
  export interface InternalAxiosRequestConfig {
      metadata?: { startedAt: number };
     _retry?: boolean;
  }
}
