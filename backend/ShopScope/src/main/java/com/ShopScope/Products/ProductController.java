package com.ShopScope.Products;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository productRepository;

    public ProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // GET /api/products?limit=10&skip=0
    @GetMapping
    public ResponseEntity<ProductListResponse> getAllProducts(
            @RequestParam(defaultValue = "30") int limit,
            @RequestParam(defaultValue = "0") int skip) {
        int page = skip / Math.max(1, limit);
        Pageable pageable = PageRequest.of(page, limit);
        Page<Product> pagedResult = productRepository.findAll(pageable);
        return ResponseEntity.ok(new ProductListResponse(pagedResult.getContent(), pagedResult.getTotalElements(), skip, limit));
    }

    // GET /api/products/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // GET /api/products/search?q=phone
    @GetMapping("/search")
    public ResponseEntity<ProductListResponse> searchProducts(
            @RequestParam("q") String query,
            @RequestParam(defaultValue = "30") int limit,
            @RequestParam(defaultValue = "0") int skip) {
        int page = skip / Math.max(1, limit);
        Pageable pageable = PageRequest.of(page, limit);
        Page<Product> pagedResult = productRepository.searchProducts(query, pageable);
        return ResponseEntity.ok(new ProductListResponse(pagedResult.getContent(), pagedResult.getTotalElements(), skip, limit));
    }

    // GET /api/products/categories
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(productRepository.findDistinctCategories());
    }

    // GET /api/products/category/{category}
    @GetMapping("/category/{category}")
    public ResponseEntity<ProductListResponse> getProductsByCategory(
            @PathVariable String category,
            @RequestParam(defaultValue = "30") int limit,
            @RequestParam(defaultValue = "0") int skip) {
        int page = skip / Math.max(1, limit);
        Pageable pageable = PageRequest.of(page, limit);
        Page<Product> pagedResult = productRepository.findByCategoryIgnoreCase(category, pageable);
        return ResponseEntity.ok(new ProductListResponse(pagedResult.getContent(), pagedResult.getTotalElements(), skip, limit));
    }

    // POST /api/products/add
    @PostMapping("/add")
    public ResponseEntity<Product> addProduct(@RequestBody Product product) {
        Product saved = productRepository.save(product);
        return ResponseEntity.ok(saved);
    }

    // DELETE /api/products/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        if (!productRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        productRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}