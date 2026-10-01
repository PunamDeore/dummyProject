package com.ShopScope.ShopScope.Order;

import com.ShopScope.ShopScope.Products.Product;
import com.ShopScope.ShopScope.Products.ProductRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public OrderService(OrderRepository orderRepository, ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<Order> getUserOrders(Long userId, String status) {
        return orderRepository.findByUserIdAndStatus(userId, status, Sort.by(Sort.Direction.DESC, "orderPlacedDate"));
    }

    @Transactional(readOnly = true)
    public Optional<Order> getOrderById(Long id) {
        return orderRepository.findById(id);
    }

    public Order createOrder(CreateOrderRequest request) {
        LocalDateTime now = LocalDateTime.now();
       
        boolean paymentPassed = request.getPaymentSuccess() != null 
                ? request.getPaymentSuccess() 
                : (!"000".equals(request.getCvv()) && request.getCardNumber() != null && !request.getCardNumber().isBlank());

        String status = paymentPassed ? "PLACED" : "FAILED";
        LocalDate arrivingDate = paymentPassed ? LocalDate.now().plusDays(4) : null;
        String failureReason = paymentPassed ? null : "Card payment authorization declined or invalid security details.";

        String last4 = "0000";
        if (request.getCardNumber() != null) {
            String sanitized = request.getCardNumber().replaceAll("\\s+", "");
            if (sanitized.length() >= 4) {
                last4 = sanitized.substring(sanitized.length() - 4);
            }
        }

        Order order = Order.builder()
                .userId(request.getUserId())
                .status(status)
                .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "CARD")
                .lastFourDigits(last4)
                .failureReason(failureReason)
                .orderPlacedDate(now)
                .arrivingDate(arrivingDate)
                .total(BigDecimal.ZERO)
                .discountedTotal(BigDecimal.ZERO)
                .totalProducts(0)
                .totalQuantity(0)
                .build();

        List<OrderItem> items = new ArrayList<>();
        BigDecimal sumTotal = BigDecimal.ZERO;
        BigDecimal sumDiscounted = BigDecimal.ZERO;
        int sumQuantity = 0;

        for (CreateOrderRequest.OrderItemRequest reqItem : request.getProducts()) {
            Optional<Product> prodOpt = productRepository.findById(reqItem.getId());
            if (prodOpt.isPresent()) {
                Product product = prodOpt.get();
                int qty = reqItem.getQuantity() != null && reqItem.getQuantity() > 0 ? reqItem.getQuantity() : 1;
                BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(qty));
                double discountRate = product.getDiscountPercentage() != null ? product.getDiscountPercentage() : 0.0;
                BigDecimal discountMultiplier = BigDecimal.valueOf(1 - (discountRate / 100.0));
                BigDecimal itemDiscounted = itemTotal.multiply(discountMultiplier).setScale(2, RoundingMode.HALF_UP);

                OrderItem item = OrderItem.builder()
                        .order(order)
                        .productId(product.getId())
                        .title(product.getTitle())
                        .price(product.getPrice())
                        .quantity(qty)
                        .total(itemTotal)
                        .discountPercentage(discountRate)
                        .discountedTotal(itemDiscounted)
                        .thumbnail(product.getThumbnail())
                        .build();

                items.add(item);
                sumTotal = sumTotal.add(itemTotal);
                sumDiscounted = sumDiscounted.add(itemDiscounted);
                sumQuantity += qty;
            }
        }

        order.setItems(items);
        order.setTotalProducts(items.size());
        order.setTotalQuantity(sumQuantity);
        order.setTotal(sumTotal);
        order.setDiscountedTotal(sumDiscounted);

        return orderRepository.save(order);
    }
}