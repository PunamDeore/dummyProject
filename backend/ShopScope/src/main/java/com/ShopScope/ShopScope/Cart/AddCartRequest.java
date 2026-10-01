package com.ShopScope.ShopScope.Cart;

import lombok.Data;
import java.util.List;

@Data
public class AddCartRequest {
    private Long userId;
    private List<CartItemRequest> products;
    private String cardNumber;
    private String cardExpiry;
    private String paymentMethod;

    @Data
    public static class CartItemRequest {
        private Long id;
        private Integer quantity;
    }
}