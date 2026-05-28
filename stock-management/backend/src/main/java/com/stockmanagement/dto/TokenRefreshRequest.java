package com.stockmanagement.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TokenRefreshRequest {
    @NotBlank(message = "Le refresh token est requis")
    private String refreshToken;
}
