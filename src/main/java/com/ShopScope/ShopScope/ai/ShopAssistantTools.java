package com.ShopScope.ShopScope.ai;

import com.ShopScope.ShopScope.Cart.AddCartRequest;
import com.ShopScope.ShopScope.Cart.Cart;
import com.ShopScope.ShopScope.Cart.CartItem;
import com.ShopScope.ShopScope.Cart.CartService;
import com.ShopScope.ShopScope.Order.CreateOrderRequest;
import com.ShopScope.ShopScope.Order.Order;
import com.ShopScope.ShopScope.Order.OrderService;
import com.ShopScope.ShopScope.Products.CategoryResponse;
import com.ShopScope.ShopScope.Products.Product;
import com.ShopScope.ShopScope.Products.ProductListResponse;
import com.ShopScope.ShopScope.Products.ProductService;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class ShopAssistantTools {

    private final ProductService productService;
    private final CartService cartService;
    private final OrderService orderService;

    public ShopAssistantTools(ProductService productService,
                              CartService cartService,
                              OrderService orderService) {
        this.productService = productService;
        this.cartService = cartService;
        this.orderService = orderService;
    }

    @Tool(description = "Fetch available product categories in the shop.")
    public List<String> getAvailableCategories() {
        return productService.getCategories().stream()
                .map(CategoryResponse::getName)
                .collect(Collectors.toList());
    }

    @Tool(description = "Search and list products by category or keyword.")
    public String getProductsByCategory(@ToolParam(description = "Category name or keyword, e.g. laptops, smartphones, furniture") String category) {
        if (category == null || category.isBlank()) {
            return "Please specify a category or search term.";
        }
        String term = category.trim();

        ProductListResponse response = productService.getProductsByCategory(term, 6, 0);

        if (response.getProducts().isEmpty()) {
            if (term.endsWith("s")) {
                response = productService.getProductsByCategory(term.substring(0, term.length() - 1), 6, 0);
            } else {
                response = productService.getProductsByCategory(term + "s", 6, 0);
            }
        }

        if (response.getProducts().isEmpty()) {
            response = productService.searchProducts(term, 6, 0);
        }

        if (response.getProducts().isEmpty()) {
            return "No products found for: " + category;
        }

        StringBuilder sb = new StringBuilder();
        for (Product p : response.getProducts()) {
            sb.append(String.format("- ID %d: %s | Price: $%s | Stock: %d\n",
                    p.getId(), p.getTitle(), p.getPrice(), p.getStock()));
        }
        return sb.toString();
    }

    @Tool(description = "Add a product item to customer cart by productId (or title/keyword) and quantity.")
    public String addToCart(
            @ToolParam(description = "Customer ID") Long userId,
            @ToolParam(description = "Product ID to add (if known)") Long productId,
            @ToolParam(description = "Product name or keyword if ID is not known, e.g. 'MacBook'") String productName,
            @ToolParam(description = "Quantity (default 1)") Integer quantity) {
        try {
            Long targetProductId = productId;

            if (targetProductId == null || targetProductId <= 0) {
                if (productName != null && !productName.isBlank()) {
                    ProductListResponse results = productService.searchProducts(productName.trim(), 1, 0);
                    if (!results.getProducts().isEmpty()) {
                        targetProductId = results.getProducts().get(0).getId();
                    }
                }
            }

            if (targetProductId == null || targetProductId <= 0) {
                return "Could not find a matching product to add to cart. Please specify the exact product name or ID.";
            }

            Optional<Product> prodOpt = productService.getProductById(targetProductId);
            if (prodOpt.isEmpty()) {
                return "Product not found with id: " + targetProductId;
            }
            Product prod = prodOpt.get();
            int qty = (quantity == null || quantity <= 0) ? 1 : quantity;

            AddCartRequest.CartItemRequest item = new AddCartRequest.CartItemRequest();
            item.setId(targetProductId);
            item.setQuantity(qty);

            AddCartRequest request = new AddCartRequest();
            request.setUserId(userId != null ? userId : 1L);
            request.setProducts(List.of(item));

            cartService.createCart(request);

            return String.format(
                "Added '%s' to cart! [CART_ACTION:ADD:{\"id\":%d,\"title\":\"%s\",\"price\":%s,\"thumbnail\":\"%s\",\"qty\":%d}]",
                prod.getTitle(),
                prod.getId(),
                prod.getTitle().replace("\"", "'"),
                prod.getPrice().toString(),
                prod.getThumbnail() != null ? prod.getThumbnail() : "",
                qty
            );
        } catch (Exception e) {
            return "Failed to add product to cart: " + e.getMessage();
        }
    }

    @Tool(description = "Place an order. If productId is not provided, it checks out the user's latest cart.")
    public String placeOrder(
            @ToolParam(description = "Customer ID") Long userId,
            @ToolParam(description = "Product ID to order directly (optional if user has a cart)") Long productId,
            @ToolParam(description = "Product name/keyword if ID unknown (optional)") String productName,
            @ToolParam(description = "Quantity (default 1)") Integer quantity) {
        try {
            Long safeUserId = userId != null ? userId : 1L;
            List<CreateOrderRequest.OrderItemRequest> itemsToOrder = new ArrayList<>();

            Long targetProductId = productId;
            if (targetProductId == null || targetProductId <= 0) {
                if (productName != null && !productName.isBlank()) {
                    ProductListResponse results = productService.searchProducts(productName.trim(), 1, 0);
                    if (!results.getProducts().isEmpty()) {
                        targetProductId = results.getProducts().get(0).getId();
                    }
                }
            }

       
            if (targetProductId != null && targetProductId > 0) {
                CreateOrderRequest.OrderItemRequest orderItem = new CreateOrderRequest.OrderItemRequest();
                orderItem.setId(targetProductId);
                orderItem.setQuantity(quantity == null || quantity <= 0 ? 1 : quantity);
                itemsToOrder.add(orderItem);
            } else {
                // Case B: Checkout items from the user's saved cart in DB
                List<Cart> userCarts = cartService.getCartsByUserId(safeUserId);
                if (userCarts.isEmpty()) {
                    return "No items found in your cart to order. Please add items before placing an order.";
                }
                Cart latestCart = userCarts.get(userCarts.size() - 1);
                for (CartItem ci : latestCart.getProducts()) {
                    CreateOrderRequest.OrderItemRequest reqItem = new CreateOrderRequest.OrderItemRequest();
                    reqItem.setId(ci.getProductId());
                    reqItem.setQuantity(ci.getQuantity());
                    itemsToOrder.add(reqItem);
                }
            }

            if (itemsToOrder.isEmpty()) {
                return "Cannot place order: No products specified or found in cart.";
            }

            CreateOrderRequest orderRequest = new CreateOrderRequest();
            orderRequest.setUserId(safeUserId);
            orderRequest.setProducts(itemsToOrder);
            orderRequest.setCardNumber("4242 4242 4242 4242");
            orderRequest.setCardExpiry("12/28");
            orderRequest.setCvv("123");
            orderRequest.setPaymentMethod("CARD");
            orderRequest.setPaymentSuccess(true);

            Order order = orderService.createOrder(orderRequest);

           
            String orderedTitles = order.getItems().stream()
                    .map(item -> item.getTitle() + " (x" + item.getQuantity() + ")")
                    .collect(Collectors.joining(", "));

            return String.format(
                "Order #%d placed successfully for %s! Total: $%s, arriving by %s. [ACTION:CLEAR_CART]",
                order.getId(),
                orderedTitles,
                order.getDiscountedTotal(),
                order.getArrivingDate()
            );
        } catch (Exception e) {
            return "Failed to place order: " + e.getMessage();
        }
    }
}