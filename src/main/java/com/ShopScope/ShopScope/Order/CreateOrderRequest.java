package com.ShopScope.ShopScope.Order;

import lombok.Data;

import java.util.List;

@Data
public class CreateOrderRequest {
    private Long userId;
    private List<OrderItemRequest> products;
    private String cardNumber;
    private String cardExpiry;
    private String cvv;
    private String paymentMethod;
    private Boolean paymentSuccess; 

    @Data
    public static class OrderItemRequest {
        private Long id;
        private Integer quantity;
    }
}