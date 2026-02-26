package com.stockmanagement.dto;

import lombok.Data;

/**
 * DTO pour la requête de connexion.
 */
@Data
public class LoginRequest {
    private String username;
    private String password;
}
