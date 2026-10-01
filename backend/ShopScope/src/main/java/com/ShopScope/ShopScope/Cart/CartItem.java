package com.ShopScope.ShopScope.Cart;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "cart_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id")
    @JsonIgnore
    private Cart cart;

    private Long productId;
    private String title;
    private BigDecimal price;
    private Integer quantity;
    private BigDecimal total;
    private Double discountPercentage;
    private BigDecimal discountedTotal;
    private String thumbnail;
}