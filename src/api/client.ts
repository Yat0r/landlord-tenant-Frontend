import axios from 'axios';
import { appEnv } from '@/app/config/env';

export const httpClient = axios.create({
  baseURL: appEnv.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

export type ApiClient = typeof httpClient;
