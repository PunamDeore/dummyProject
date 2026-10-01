import { Client } from '@stomp/stompjs';
import { logger } from '../config/logger';

export interface ProductEvent {
  action: 'CREATED' | 'UPDATED' | 'DELETED';
  product?: any;
  productId?: number;
}

export function subscribeToProducts(onMessage: (event: ProductEvent) => void): () => void {
  const client = new Client({
    brokerURL: 'ws://localhost:8080/ws/websocket',
    reconnectDelay: 5000,
    debug: (str) => logger.debug(`[STOMP] ${str}`),
  });

  client.onConnect = () => {
    logger.info('[STOMP] Connected to backend WebSocket');
    client.subscribe('/topic/products', (message) => {
      try {
        const payload: ProductEvent = JSON.parse(message.body);
        onMessage(payload);
      } catch (err) {
        logger.error('[STOMP] Failed to parse message payload', err);
      }
    });
  };

  client.onStompError = (frame) => {
    logger.error('[STOMP] Broker error:', frame.headers['message']);
  };

  client.activate();

  return () => {
    client.deactivate();
  };
}