// package com.ShopScope.ShopScope.config;

// import com.ShopScope.ShopScope.Products.Product;
// import com.ShopScope.ShopScope.Products.ProductRepository;
// import com.ShopScope.ShopScope.user.User;
// import com.ShopScope.ShopScope.user.UserRepository;
// import org.springframework.boot.CommandLineRunner;
// import org.springframework.stereotype.Component;

// import java.math.BigDecimal;
// import java.util.List;

// @Component
// public class DataInitializer implements CommandLineRunner {

//     private final ProductRepository productRepository;
//     private final UserRepository userRepository;

//     public DataInitializer(ProductRepository productRepository, UserRepository userRepository) {
//         this.productRepository = productRepository;
//         this.userRepository = userRepository;
//     }

//     @Override
//     public void run(String... args) {
//         if (userRepository.count() == 0) {
//             userRepository.saveAll(List.of(
//                 User.builder()
//                     .username("emilys")
//                     .password("emilyspass")
//                     .email("emily.smith@x.dummyjson.com")
//                     .firstName("Emily")
//                     .lastName("Smith")
//                     .gender("female")
//                     .image("https://dummyjson.com/icon/emilys/128")
//                     .role("admin")
//                     .build(),
//                 User.builder()
//                     .username("averyp")
//                     .password("averyppass")
//                     .email("avery.perez@x.dummyjson.com")
//                     .firstName("Avery")
//                     .lastName("Perez")
//                     .gender("male")
//                     .image("https://dummyjson.com/icon/averyp/128")
//                     .role("user")
//                     .build()
//             ));
//         }

//         if (productRepository.count() == 0) {
//             productRepository.saveAll(List.of(
//                 Product.builder()
//                     .title("iPhone 15 Pro")
//                     .description("Titanium design with A17 Pro chip and Super Retina XDR display.")
//                     .category("smartphones")
//                     .price(new BigDecimal("999.00"))
//                     .discountPercentage(8.5)
//                     .rating(4.8)
//                     .stock(30)
//                     .brand("Apple")
//                     .sku("APP-IPH15-PRO")
//                     .warrantyInformation("1 year official warranty")
//                     .shippingInformation("Ships in 1-2 business days")
//                     .returnPolicy("30 days return policy")
//                     .thumbnail("https://cdn.dummyjson.com/products/images/smartphones/iPhone%2013%20Pro/thumbnail.png")
//                     .tags(List.of("smartphones", "apple", "ios"))
//                     .build(),
//                 Product.builder()
//                     .title("MacBook Pro 16")
//                     .description("M3 Max chip with unbelievable performance and battery life.")
//                     .category("laptops")
//                     .price(new BigDecimal("2499.00"))
//                     .discountPercentage(5.0)
//                     .rating(4.9)
//                     .stock(15)
//                     .brand("Apple")
//                     .sku("APP-MBP16-M3")
//                     .warrantyInformation("2 year warranty")
//                     .shippingInformation("Free expedited shipping")
//                     .returnPolicy("14 days return policy")
//                     .thumbnail("https://cdn.dummyjson.com/products/images/laptops/Apple%20MacBook%20Pro%2014%20Inch%20Space%20Grey/thumbnail.png")
//                     .tags(List.of("laptops", "apple", "macos"))
//                     .build(),
//                 Product.builder()
//                     .title("Samsung Galaxy S24 Ultra")
//                     .description("Galaxy AI camera experience with titanium casing and S-Pen.")
//                     .category("smartphones")
//                     .price(new BigDecimal("1199.00"))
//                     .discountPercentage(10.0)
//                     .rating(4.7)
//                     .stock(20)
//                     .brand("Samsung")
//                     .sku("SAM-S24-ULT")
//                     .warrantyInformation("1 year manufacturer warranty")
//                     .shippingInformation("Ships in 24 hours")
//                     .returnPolicy("30 days return policy")
//                     .thumbnail("https://cdn.dummyjson.com/products/images/smartphones/Samsung%20Galaxy%20S24%20Ultra/thumbnail.png")
//                     .tags(List.of("smartphones", "samsung", "android"))
//                     .build(),
//                 Product.builder()
//                     .title("Dell XPS 15")
//                     .description("Stunning OLED infinity-edge display with Intel Core i9.")
//                     .category("laptops")
//                     .price(new BigDecimal("1899.00"))
//                     .discountPercentage(12.0)
//                     .rating(4.6)
//                     .stock(10)
//                     .brand("Dell")
//                     .sku("DEL-XPS15-OLED")
//                     .warrantyInformation("1 year premium support")
//                     .shippingInformation("Ships in 3-5 days")
//                     .returnPolicy("30 days return policy")
//                     .thumbnail("https://cdn.dummyjson.com/products/images/laptops/Dell%20XPS%2015%209530/thumbnail.png")
//                     .tags(List.of("laptops", "dell", "windows"))
//                     .build(),
//                 Product.builder()
//                     .title("Sony WH-1000XM5")
//                     .description("Industry-leading active noise canceling wireless headphones.")
//                     .category("audio")
//                     .price(new BigDecimal("399.00"))
//                     .discountPercentage(15.0)
//                     .rating(4.8)
//                     .stock(50)
//                     .brand("Sony")
//                     .sku("SNY-WH1000XM5")
//                     .warrantyInformation("1 year warranty")
//                     .shippingInformation("Ships in 2 business days")
//                     .returnPolicy("30 days return policy")
//                     .thumbnail("https://placehold.co/300x200?text=Sony+WH-1000XM5")
//                     .tags(List.of("audio", "sony", "headphones"))
//                     .build()
//             ));
//         }
//     }
// }