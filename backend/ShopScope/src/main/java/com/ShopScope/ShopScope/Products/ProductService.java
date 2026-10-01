package com.ShopScope.ShopScope.Products;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class ProductService {

    private final ProductRepository productRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public ProductService(ProductRepository productRepository, SimpMessagingTemplate messagingTemplate) {
        this.productRepository = productRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional(readOnly = true)
    public ProductListResponse getAllProducts(int limit, int skip, String sortBy, String order) {
        int page = skip / limit;
        Sort sort = Sort.unsorted();
        if (sortBy != null && !sortBy.isBlank()) {
            sort = order.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        }
        Pageable pageable = PageRequest.of(page, limit, sort);
        Page<Product> pagedResult = productRepository.findAll(pageable);
        return new ProductListResponse(pagedResult.getContent(), pagedResult.getTotalElements(), skip, limit);
    }

    @Transactional(readOnly = true)
    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public ProductListResponse searchProducts(String query, int limit, int skip) {
        int page = skip / limit;
        Pageable pageable = PageRequest.of(page, limit);
        Page<Product> pagedResult = productRepository.searchProducts(query, pageable);
        return new ProductListResponse(pagedResult.getContent(), pagedResult.getTotalElements(), skip, limit);
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategories() {
        List<String> rawCategories = productRepository.findDistinctCategories();
        return rawCategories.stream()
                .map(c -> new CategoryResponse(
                        c.toLowerCase(),
                        c.substring(0, 1).toUpperCase() + c.substring(1),
                        "http://localhost:8080/api/products/category/" + c.toLowerCase()
                ))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductListResponse getProductsByCategory(String category, int limit, int skip) {
        int page = skip / limit;
        Pageable pageable = PageRequest.of(page, limit);
        Page<Product> pagedResult = productRepository.findByCategoryIgnoreCase(category, pageable);
        return new ProductListResponse(pagedResult.getContent(), pagedResult.getTotalElements(), skip, limit);
    }

    public Product addProduct(Product product) {
        if (product.getThumbnail() == null || product.getThumbnail().isBlank()) {
            product.setThumbnail("https://placehold.co/300x200?text=" + product.getTitle().replace(" ", "+"));
        }
        Product saved = productRepository.save(product);

        messagingTemplate.convertAndSend("/topic/products", Map.of(
                "action", "CREATED",
                "product", saved
        ));
        return saved;
    }

    public Optional<Product> updateProduct(Long id, Map<String, Object> patch) {
        Optional<Product> optionalProduct = productRepository.findById(id);
        if (optionalProduct.isEmpty()) {
            return Optional.empty();
        }

        Product product = optionalProduct.get();
        if (patch.containsKey("title")) product.setTitle((String) patch.get("title"));
        if (patch.containsKey("description")) product.setDescription((String) patch.get("description"));
        if (patch.containsKey("category")) product.setCategory((String) patch.get("category"));
        if (patch.containsKey("price")) product.setPrice(new BigDecimal(patch.get("price").toString()));
        if (patch.containsKey("stock")) product.setStock(Integer.parseInt(patch.get("stock").toString()));

        Product updated = productRepository.save(product);

        messagingTemplate.convertAndSend("/topic/products", Map.of(
                "action", "UPDATED",
                "product", updated
        ));
        return Optional.of(updated);
    }

    public Optional<Map<String, Object>> deleteProduct(Long id) {
        Optional<Product> optionalProduct = productRepository.findById(id);
        if (optionalProduct.isEmpty()) {
            return Optional.empty();
        }

        productRepository.deleteById(id);

        messagingTemplate.convertAndSend("/topic/products", Map.of(
                "action", "DELETED",
                "productId", id
        ));

        return Optional.of(Map.of(
                "id", id,
                "title", optionalProduct.get().getTitle(),
                "isDeleted", true,
                "deletedOn", Instant.now().toString()
        ));
    }
}