package com.ShopScope.ShopScope.user;

import com.ShopScope.ShopScope.exception.BadRequestException;
import com.ShopScope.ShopScope.exception.ResourceNotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<UserListResponse> listUsers(
            @RequestParam(defaultValue = "12") int limit,
            @RequestParam(defaultValue = "0") int skip) {
        if (limit <= 0) {
            throw new BadRequestException("Limit must be greater than zero");
        }
        if (skip < 0) {
            throw new BadRequestException("Skip cannot be negative");
        }
        return ResponseEntity.ok(userService.listUsers(limit, skip));
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        if (id == null || id <= 0) {
            throw new BadRequestException("A valid user ID must be provided");
        }
        User user = userService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return ResponseEntity.ok(user);
    }
}