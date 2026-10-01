package com.ShopScope.ShopScope.Products;
import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class ProductListResponse {
    private List<Product> products;
    private long total;
    private int skip;
    private int limit;
}