package com.ShopScope.ShopScope;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@ComponentScan(basePackages = "com.ShopScope")
@EnableJpaRepositories(basePackages = "com.ShopScope")
@EntityScan(basePackages = "com.ShopScope")
public class ShopScopeApplication {
    public static void main(String[] args) {
        System.setProperty("javax.net.ssl.trustStoreType", "WINDOWS-ROOT");
        SpringApplication.run(ShopScopeApplication.class, args);
    }
}