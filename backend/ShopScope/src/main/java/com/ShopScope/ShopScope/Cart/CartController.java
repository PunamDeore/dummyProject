package com.ShopScope.ShopScope.Cart;

import com.ShopScope.ShopScope.exception.BadRequestException;
import com.ShopScope.ShopScope.exception.ResourceNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/carts")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<CartListResponse> getAllCarts(
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "0") int skip) {
        if (limit <= 0) {
            throw new BadRequestException("Limit must be greater than zero");
        }
        if (skip < 0) {
            throw new BadRequestException("Skip cannot be negative");
        }
        return ResponseEntity.ok(cartService.getAllCarts(limit, skip));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cart> getCartById(@PathVariable Long id) {
        if (id == null || id <= 0) {
            throw new BadRequestException("A valid cart ID must be provided");
        }
        Cart cart = cartService.getCartById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found with id: " + id));
        return ResponseEntity.ok(cart);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Cart>> getCartsByUser(@PathVariable Long userId) {
        if (userId == null || userId <= 0) {
            throw new BadRequestException("A valid user ID must be provided");
        }
        return ResponseEntity.ok(cartService.getCartsByUserId(userId));
    }

    @PostMapping("/add")
    public ResponseEntity<Cart> addCart(@RequestBody AddCartRequest request) {
        if (request == null) {
            throw new BadRequestException("Cart payload cannot be empty");
        }
        if (request.getUserId() == null || request.getUserId() <= 0) {
            throw new BadRequestException("A valid user ID is required");
        }
        if (request.getProducts() == null || request.getProducts().isEmpty()) {
            throw new BadRequestException("At least one product item is required");
        }
        for (AddCartRequest.CartItemRequest item : request.getProducts()) {
            if (item.getId() == null || item.getQuantity() == null || item.getQuantity() <= 0) {
                throw new BadRequestException("Each product item must have a valid ID and quantity >= 1");
            }
        }

        Cart createdCart = cartService.createCart(request)
                .orElseThrow(() -> new ResourceNotFoundException("One or more products specified in the cart were not found"));

        return ResponseEntity.ok(createdCart);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCart(@PathVariable Long id) {
        if (id == null || id <= 0) {
            throw new BadRequestException("A valid cart ID must be provided");
        }
        boolean deleted = cartService.deleteCart(id);
        if (!deleted) {
            throw new ResourceNotFoundException("Cannot delete: Cart not found with id: " + id);
        }
        return ResponseEntity.noContent().build();
    }
}