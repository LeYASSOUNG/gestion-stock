package com.stockmanagement.dto;

import com.stockmanagement.entity.UserRole;
import lombok.Data;

/**
 * DTO pour la requête d'inscription d'un nouvel utilisateur.
 */
@Data
public class RegisterRequest {
    private String username;
    private String password;
    private String email;
    private String firstName;
    private String lastName;
    private UserRole role;
}
