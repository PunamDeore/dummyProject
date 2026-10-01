package com.ShopScope.ShopScope.auth;

import com.ShopScope.ShopScope.exception.BadRequestException;
import com.ShopScope.ShopScope.exception.ResourceNotFoundException;
import com.ShopScope.ShopScope.exception.UnauthorizedException;
import com.ShopScope.ShopScope.user.User;
import com.ShopScope.ShopScope.user.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    public AuthController(AuthService authService, UserService userService) {
        this.authService = authService;
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        if (credentials == null) {
            throw new BadRequestException("Login body cannot be empty");
        }
        String username = credentials.get("username");
        String password = credentials.get("password");

        if (username == null || username.trim().isEmpty() || password == null || password.trim().isEmpty()) {
            throw new BadRequestException("Username and password are required");
        }

        Map<String, Object> authData = authService.authenticate(username.trim(), password)
                .orElseThrow(() -> new UnauthorizedException("Invalid username or password"));

        return ResponseEntity.ok(authData);
    }

    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody Map<String, String> body) {
        if (body == null) {
            throw new BadRequestException("Registration request cannot be empty");
        }

        String username = body.get("username");
        String password = body.get("password");

        if (username == null || username.trim().isEmpty()) {
            throw new BadRequestException("Username is required");
        }
        if (password == null || password.trim().isEmpty()) {
            throw new BadRequestException("Password is required");
        }
        if (userService.existsByUsername(username.trim())) {
            throw new BadRequestException("Username '" + username.trim() + "' is already taken");
        }

        User user = authService.createUser(body);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Missing or invalid Authorization header");
        }

        String token = authHeader.replace("Bearer ", "").trim();
        Map<String, Object> userData = authService.getUserFromToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("User identified by token was not found"));

        return ResponseEntity.ok(userData);
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody Map<String, Object> body) {
        if (body == null || !body.containsKey("refreshToken") || body.get("refreshToken") == null) {
            throw new BadRequestException("Refresh token is required");
        }
        String refreshToken = body.get("refreshToken").toString();
        Map<String, String> tokens = authService.refresh(refreshToken)
                .orElseThrow(() -> new UnauthorizedException("Invalid or expired refresh token"));
        return ResponseEntity.ok(tokens);
    }
}