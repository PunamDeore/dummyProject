package com.ShopScope.Cart;
import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class CartListResponse {
    private List<Cart> carts;
    private long total;
    private int skip;
    private int limit;
}