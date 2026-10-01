package com.ShopScope.ShopScope.config;

import org.apache.hc.client5.http.impl.classic.CloseableHttpClient;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.apache.hc.client5.http.impl.io.PoolingHttpClientConnectionManagerBuilder;
import org.apache.hc.client5.http.ssl.NoopHostnameVerifier;
import org.apache.hc.client5.http.ssl.SSLConnectionSocketFactoryBuilder;
import org.apache.hc.client5.http.ssl.TrustAllStrategy;
import org.apache.hc.core5.ssl.SSLContextBuilder;
import org.springframework.boot.web.client.RestClientCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;

import javax.net.ssl.SSLContext;

@Configuration
public class SslBypassConfig {

    @Bean
    public RestClientCustomizer restClientCustomizer() {
        return restClientBuilder -> {
            try {
                SSLContext sslContext = SSLContextBuilder.create()
                        .loadTrustMaterial(new TrustAllStrategy())
                        .build();

                var sslSocketFactory = SSLConnectionSocketFactoryBuilder.create()
                        .setSslContext(sslContext)
                        .setHostnameVerifier(NoopHostnameVerifier.INSTANCE)
                        .build();

                var connectionManager = PoolingHttpClientConnectionManagerBuilder.create()
                        .setSSLSocketFactory(sslSocketFactory)
                        .build();

                CloseableHttpClient httpClient = HttpClients.custom()
                        .setConnectionManager(connectionManager)
                        .build();

                restClientBuilder.requestFactory(new HttpComponentsClientHttpRequestFactory(httpClient));
            } catch (Exception e) {
                throw new RuntimeException("Failed to configure SSL bypass", e);
            }
        };
    }
}