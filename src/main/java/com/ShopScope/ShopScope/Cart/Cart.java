package com.ShopScope.ShopScope.Cart;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "carts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cart {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private BigDecimal total;
    private BigDecimal discountedTotal;
    private Integer totalProducts;
    private Integer totalQuantity;

    private String paymentStatus;
    private String lastFourDigits;

    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CartItem> products = new ArrayList<>();

    public void recalculateTotals() {
        this.totalProducts = products.size();
        this.totalQuantity = products.stream().mapToInt(CartItem::getQuantity).sum();
        this.total = products.stream()
                .map(CartItem::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        this.discountedTotal = products.stream()
                .map(CartItem::getDiscountedTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}