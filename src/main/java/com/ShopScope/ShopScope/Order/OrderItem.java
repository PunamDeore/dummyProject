package com.ShopScope.ShopScope.Order;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    @JsonBackReference
    private Order order;

    private Long productId;
    private String title;
    private BigDecimal price;
    private Integer quantity;
    private BigDecimal total;
    private Double discountPercentage;
    private BigDecimal discountedTotal;
    private String thumbnail;
}