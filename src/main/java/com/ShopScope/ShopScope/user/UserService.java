package com.ShopScope.ShopScope.user;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserListResponse listUsers(int limit, int skip) {
        int page = skip / limit;
        Page<User> userPage = userRepository.findAll(PageRequest.of(page, limit));
        List<UserResponse> responses = userPage.getContent().stream()
                .map(u -> UserResponse.builder()
                        .id(u.getId())
                        .username(u.getUsername())
                        .email(u.getEmail())
                        .firstName(u.getFirstName())
                        .lastName(u.getLastName())
                        .image(u.getImage())
                        .role(u.getRole())
                        .company(Map.of("title", "ShopScope Member"))
                        .build())
                .collect(Collectors.toList());
        return new UserListResponse(responses, userPage.getTotalElements(), skip, limit);
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    @Transactional
    public User saveUser(User user) {
        return userRepository.save(user);
    }
}