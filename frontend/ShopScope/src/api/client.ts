import axios, { type AxiosInstance, type CreateAxiosDefaults } from 'axios';
import { env } from '../config/env';
const baseConfig: CreateAxiosDefaults = {
  baseURL: env.api.baseUrl,
  timeout: env.api.timeoutMs, // axios's default is 0 = wait forever. Never ship that.
  headers: { 'Content-Type': 'application/json' },
};

export const api: AxiosInstance = axios.create(baseConfig);
export const bareApi: AxiosInstance = axios.create(baseConfig);
export const uploadApi: AxiosInstance = axios.create({ baseURL: env.upload.baseUrl, timeout: 0 });
