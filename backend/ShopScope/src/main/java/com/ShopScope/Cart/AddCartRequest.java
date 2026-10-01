package com.ShopScope.Cart;

import lombok.Data;
import java.util.List;

@Data
public class AddCartRequest {
    private Long userId;
    private List<CartItemRequest> products;

    @Data
    public static class CartItemRequest {
        private Long id;
        private Integer quantity;
    }
}