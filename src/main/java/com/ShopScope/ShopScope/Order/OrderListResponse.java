package com.ShopScope.ShopScope.Order;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class OrderListResponse {
    private List<Order> orders;
    private long total;
    private int skip;
    private int limit;
}