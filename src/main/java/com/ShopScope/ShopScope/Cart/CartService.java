package com.ShopScope.ShopScope.Cart;

import com.ShopScope.ShopScope.Products.Product;
import com.ShopScope.ShopScope.Products.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;

    public CartService(CartRepository cartRepository, ProductRepository productRepository) {
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public CartListResponse getAllCarts(int limit, int skip) {
        int page = skip / limit;
        Pageable pageable = PageRequest.of(page, limit);
        Page<Cart> result = cartRepository.findAll(pageable);
        return new CartListResponse(result.getContent(), result.getTotalElements(), skip, limit);
    }

    @Transactional(readOnly = true)
    public Optional<Cart> getCartById(Long id) {
        return cartRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<Cart> getCartsByUserId(Long userId) {
        return cartRepository.findByUserId(userId);
    }

    public Optional<Cart> createCart(AddCartRequest request) {
        Cart cart = new Cart();
        cart.setUserId(request.getUserId());

        if (request.getCardNumber() != null && request.getCardNumber().trim().length() >= 4) {
            String sanitized = request.getCardNumber().replaceAll("\\s+", "");
            cart.setLastFourDigits(sanitized.substring(sanitized.length() - 4));
            cart.setPaymentStatus("PAID");
        } else {
            cart.setPaymentStatus("PAID");
            cart.setLastFourDigits("4242");
        }

        List<CartItem> items = new ArrayList<>();
        for (AddCartRequest.CartItemRequest reqItem : request.getProducts()) {
            Optional<Product> productOpt = productRepository.findById(reqItem.getId());
            if (productOpt.isEmpty()) {
                return Optional.empty(); // Returns empty if any product ID doesn't exist
            }

            Product product = productOpt.get();
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
        return Optional.of(cartRepository.save(cart));
    }

    public boolean deleteCart(Long id) {
        if (!cartRepository.existsById(id)) {
            return false;
        }
        cartRepository.deleteById(id);
        return true;
    }
}