package com.ShopScope.ShopScope.user;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserListResponse {
    private List<UserResponse> users;
    private long total;
    private int skip;
    private int limit;
}