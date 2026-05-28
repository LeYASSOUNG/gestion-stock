package com.stockmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * DTO pour la réponse d'authentification contenant le jeton JWT et les infos
 * utilisateur.
 */
@Data
@AllArgsConstructor
public class JwtResponse {
    private String token;
    private String refreshToken;
    private String username;
    private String firstName;
    private String lastName;
    private String role;
    private Long companyId;
    private String companyName;
    private String companyType;
}
