import { api } from '../client';
import { installAuthInterceptor } from './auth';
import { installLoggingInterceptor } from './logging';
import { installRefreshInterceptor } from './refresh';
import { installErrorNormalizer } from './errorNormalizer';


export function installInterceptors() {
  installAuthInterceptor(api); 
  installLoggingInterceptor(api);
  installRefreshInterceptor(api);
  installErrorNormalizer(api);
}
