package com.ShopScope.ShopScope.auth;

import com.ShopScope.ShopScope.security.JwtService;
import com.ShopScope.ShopScope.user.User;
import com.ShopScope.ShopScope.user.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, JwtService jwtService, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    public Optional<Map<String, Object>> authenticate(String username, String password) {
        Optional<User> optionalUser = userRepository.findByUsername(username);
        if (optionalUser.isEmpty()) {
            return Optional.empty();
        }

        User user = optionalUser.get();
        boolean matches = passwordEncoder.matches(password, user.getPassword()) || user.getPassword().equals(password);
        if (!matches) {
            return Optional.empty();
        }

        String accessToken = jwtService.generateAccessToken(user.getId(), user.getUsername(), user.getRole());
        String refreshToken = jwtService.generateRefreshToken(user.getId(), user.getUsername());

        return Optional.of(Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "email", user.getEmail() != null ? user.getEmail() : "",
                "firstName", user.getFirstName() != null ? user.getFirstName() : user.getUsername(),
                "lastName", user.getLastName() != null ? user.getLastName() : "",
                "gender", user.getGender() != null ? user.getGender() : "other",
                "image", user.getImage() != null ? user.getImage() : "https://dummyjson.com/icon/" + user.getUsername() + "/128",
                "role", user.getRole(),
                "accessToken", accessToken,
                "refreshToken", refreshToken
        ));
    }

    public User createUser(Map<String, String> body) {
        String username = body.get("username").trim();
        String password = body.get("password");

        User newUser = User.builder()
                .username(username)
                .password(passwordEncoder.encode(password))
                .firstName(body.getOrDefault("firstName", username))
                .lastName(body.getOrDefault("lastName", ""))
                .email(body.getOrDefault("email", username + "@example.com"))
                .gender(body.getOrDefault("gender", "other"))
                .image(body.getOrDefault("image", "https://placehold.co/128?text=" + username))
                .role(body.getOrDefault("role", "user"))
                .build();

        return userRepository.save(newUser);
    }

    public Optional<Map<String, Object>> getUserFromToken(String token) {
        try {
            String username = jwtService.extractUsername(token);
            if (username == null || jwtService.isTokenExpired(token)) {
                return Optional.empty();
            }

            return userRepository.findByUsername(username).map(u -> Map.of(
                    "id", u.getId(),
                    "username", u.getUsername(),
                    "email", u.getEmail() != null ? u.getEmail() : "",
                    "firstName", u.getFirstName() != null ? u.getFirstName() : u.getUsername(),
                    "lastName", u.getLastName() != null ? u.getLastName() : "",
                    "gender", u.getGender() != null ? u.getGender() : "other",
                    "image", u.getImage() != null ? u.getImage() : "https://dummyjson.com/icon/" + u.getUsername() + "/128",
                    "role", u.getRole()
            ));
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    public Optional<Map<String, String>> refresh(String refreshToken) {
        try {
            String username = jwtService.extractUsername(refreshToken);
            if (username != null && !jwtService.isTokenExpired(refreshToken)) {
                Optional<User> userOpt = userRepository.findByUsername(username);
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    String newAccessToken = jwtService.generateAccessToken(user.getId(), user.getUsername(), user.getRole());
                    String newRefreshToken = jwtService.generateRefreshToken(user.getId(), user.getUsername());
                    return Optional.of(Map.of(
                            "accessToken", newAccessToken,
                            "refreshToken", newRefreshToken
                    ));
                }
            }
        } catch (Exception ignored) {}
        return Optional.empty();
    }
}