package com.ShopScope.Cart;
import com.ShopScope.Cart.CartRepository;
import com.ShopScope.Products.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/carts")
public class CartController {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;

    public CartController(CartRepository cartRepository, ProductRepository productRepository) {
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
    }

    // GET /api/carts
    @GetMapping
    public ResponseEntity<CartListResponse> getAllCarts(
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "0") int skip) {
        int page = skip / Math.max(1, limit);
        Pageable pageable = PageRequest.of(page, limit);
        Page<Cart> result = cartRepository.findAll(pageable);
        return ResponseEntity.ok(new CartListResponse(result.getContent(), result.getTotalElements(), skip, limit));
    }

    // GET /api/carts/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Cart> getCartById(@PathVariable Long id) {
        return cartRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // GET /api/carts/user/{userId}
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Cart>> getCartsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(cartRepository.findByUserId(userId));
    }

    // POST /api/carts/add
    @PostMapping("/add")
    public ResponseEntity<Cart> addCart(@RequestBody AddCartRequest request) {
        Cart cart = new Cart();
        cart.setUserId(request.getUserId());

        List<CartItem> items = new ArrayList<>();
        for (AddCartRequest.CartItemRequest reqItem : request.getProducts()) {
            Product product = productRepository.findById(reqItem.getId()).orElse(null);
            if (product == null) continue;

            BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(reqItem.getQuantity()));
            double discountRate = product.getDiscountPercentage() != null ? product.getDiscountPercentage() : 0.0;
            BigDecimal discountMultiplier = BigDecimal.valueOf(1 - (discountRate / 100.0));
            BigDecimal discountedTotal = itemTotal.multiply(discountMultiplier).setScale(2, RoundingMode.HALF_UP);

            CartItem item = CartItem.builder()
                    .cart(cart)
                    .productId(product.getId())
                    .title(product.getTitle())
                    .price(product.getPrice())
                    .quantity(reqItem.getQuantity())
                    .total(itemTotal)
                    .discountPercentage(discountRate)
                    .discountedTotal(discountedTotal)
                    .thumbnail(product.getThumbnail())
                    .build();

            items.add(item);
        }

        cart.setProducts(items);
        cart.recalculateTotals();
        return ResponseEntity.ok(cartRepository.save(cart));
    }

    // DELETE /api/carts/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCart(@PathVariable Long id) {
        if (!cartRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        cartRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}