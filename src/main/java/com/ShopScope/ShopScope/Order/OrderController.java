package com.ShopScope.ShopScope.Order;

import com.ShopScope.ShopScope.exception.BadRequestException;
import com.ShopScope.ShopScope.exception.ResourceNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Order>> getUserOrders(
            @PathVariable Long userId,
            @RequestParam(required = false) String status) {
        if (userId == null || userId <= 0) {
            throw new BadRequestException("A valid user ID must be provided");
        }
        return ResponseEntity.ok(orderService.getUserOrders(userId, status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        if (id == null || id <= 0) {
            throw new BadRequestException("A valid order ID must be provided");
        }
        Order order = orderService.getOrderById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        return ResponseEntity.ok(order);
    }

    @PostMapping("/create")
    public ResponseEntity<Order> createOrder(@RequestBody CreateOrderRequest request) {
        if (request == null) {
            throw new BadRequestException("Order request payload cannot be empty");
        }
        if (request.getUserId() == null || request.getUserId() <= 0) {
            throw new BadRequestException("A valid user ID is required");
        }
        if (request.getProducts() == null || request.getProducts().isEmpty()) {
            throw new BadRequestException("At least one product is required to generate an order");
        }
        Order order = orderService.createOrder(request);
        return ResponseEntity.ok(order);
    }
}