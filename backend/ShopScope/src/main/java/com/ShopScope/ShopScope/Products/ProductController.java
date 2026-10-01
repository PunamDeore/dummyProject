package com.ShopScope.ShopScope.Products;

import com.ShopScope.ShopScope.exception.BadRequestException;
import com.ShopScope.ShopScope.exception.ResourceNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<ProductListResponse> getAllProducts(
            @RequestParam(defaultValue = "12") int limit,
            @RequestParam(defaultValue = "0") int skip,
            @RequestParam(required = false) String sortBy,
            @RequestParam(defaultValue = "asc") String order) {
        if (limit <= 0) {
            throw new BadRequestException("Limit must be greater than zero");
        }
        if (skip < 0) {
            throw new BadRequestException("Skip cannot be negative");
        }
        return ResponseEntity.ok(productService.getAllProducts(limit, skip, sortBy, order));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        if (id == null || id <= 0) {
            throw new BadRequestException("A valid product ID must be provided");
        }
        Product product = productService.getProductById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return ResponseEntity.ok(product);
    }

    @GetMapping("/search")
    public ResponseEntity<ProductListResponse> searchProducts(
            @RequestParam("q") String query,
            @RequestParam(defaultValue = "12") int limit,
            @RequestParam(defaultValue = "0") int skip) {
        if (query == null || query.trim().isEmpty()) {
            throw new BadRequestException("Search query cannot be empty");
        }
        if (limit <= 0) {
            throw new BadRequestException("Limit must be greater than zero");
        }
        if (skip < 0) {
            throw new BadRequestException("Skip cannot be negative");
        }
        return ResponseEntity.ok(productService.searchProducts(query.trim(), limit, skip));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryResponse>> getCategories() {
        return ResponseEntity.ok(productService.getCategories());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<ProductListResponse> getProductsByCategory(
            @PathVariable String category,
            @RequestParam(defaultValue = "12") int limit,
            @RequestParam(defaultValue = "0") int skip) {
        if (category == null || category.trim().isEmpty()) {
            throw new BadRequestException("Category parameter cannot be empty");
        }
        if (limit <= 0) {
            throw new BadRequestException("Limit must be greater than zero");
        }
        if (skip < 0) {
            throw new BadRequestException("Skip cannot be negative");
        }
        return ResponseEntity.ok(productService.getProductsByCategory(category.trim(), limit, skip));
    }

    @PostMapping("/add")
    public ResponseEntity<Product> addProduct(@RequestBody Product product) {
        if (product == null) {
            throw new BadRequestException("Product body cannot be empty");
        }
        if (product.getTitle() == null || product.getTitle().trim().length() < 2) {
            throw new BadRequestException("Product title must be at least 2 characters");
        }
        if (product.getPrice() == null || product.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Product price must be greater than zero");
        }
        if (product.getStock() == null || product.getStock() < 0) {
            throw new BadRequestException("Stock cannot be negative");
        }
        if (product.getCategory() == null || product.getCategory().trim().isEmpty()) {
            throw new BadRequestException("Product category is required");
        }
        return ResponseEntity.ok(productService.addProduct(product));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Map<String, Object> patch) {
        if (id == null || id <= 0) {
            throw new BadRequestException("A valid product ID must be provided");
        }
        if (patch == null || patch.isEmpty()) {
            throw new BadRequestException("Patch payload cannot be empty");
        }
        if (patch.containsKey("title") && ((String) patch.get("title")).trim().length() < 2) {
            throw new BadRequestException("Title must be at least 2 characters");
        }
        if (patch.containsKey("price")) {
            try {
                BigDecimal price = new BigDecimal(patch.get("price").toString());
                if (price.compareTo(BigDecimal.ZERO) <= 0) {
                    throw new BadRequestException("Price must be greater than zero");
                }
            } catch (NumberFormatException e) {
                throw new BadRequestException("Invalid price number format");
            }
        }
        if (patch.containsKey("stock")) {
            try {
                int stock = Integer.parseInt(patch.get("stock").toString());
                if (stock < 0) {
                    throw new BadRequestException("Stock cannot be negative");
                }
            } catch (NumberFormatException e) {
                throw new BadRequestException("Invalid stock number format");
            }
        }

        Product updated = productService.updateProduct(id, patch)
                .orElseThrow(() -> new ResourceNotFoundException("Cannot update: Product not found with id: " + id));

        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        if (id == null || id <= 0) {
            throw new BadRequestException("A valid product ID must be provided");
        }
        Map<String, Object> result = productService.deleteProduct(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cannot delete: Product not found with id: " + id));

        return ResponseEntity.ok(result);
    }
}