package com.ShopScope.ShopScope.Order;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("SELECT o FROM Order o WHERE o.userId = :userId " +
           "AND (:status IS NULL OR :status = '' OR LOWER(o.status) = LOWER(:status))")
    List<Order> findByUserIdAndStatus(@Param("userId") Long userId, @Param("status") String status, Sort sort);
}