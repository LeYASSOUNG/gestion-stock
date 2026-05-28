package com.stockmanagement.controller;

import com.stockmanagement.dto.JwtResponse;
import com.stockmanagement.dto.LoginRequest;
import com.stockmanagement.dto.RegisterRequest;
import com.stockmanagement.entity.User;
import com.stockmanagement.entity.UserRole;
import com.stockmanagement.repository.UserRepository;
import com.stockmanagement.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

/**
 * Contrôleur gérant l'authentification et l'enregistrement des utilisateurs.
 * Gère les requêtes de connexion et de création de compte.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final com.stockmanagement.service.RefreshTokenService refreshTokenService;

    @PostMapping("/login")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<?> authenticateUser(@jakarta.validation.Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtTokenProvider.generateJwtToken(authentication);

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Error: User not found"));
        
        com.stockmanagement.entity.RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());
        
        String role = userDetails.getAuthorities().stream()
                .findFirst()
                .map(auth -> auth.getAuthority().replace("ROLE_", ""))
                .orElse("OPERATOR");

        Long companyId = null;
        String companyName = null;
        String companyType = null;
        
        if (user.getCompany() != null) {
            companyId = user.getCompany().getId();
            companyName = user.getCompany().getName();
            companyType = user.getCompany().getType().name();
        }

        return ResponseEntity
                .ok(new JwtResponse(jwt, refreshToken.getToken(), userDetails.getUsername(), user.getFirstName(), user.getLastName(), role, companyId, companyName, companyType));
    }

    @PostMapping("/refreshtoken")
    public ResponseEntity<?> refreshtoken(@jakarta.validation.Valid @RequestBody com.stockmanagement.dto.TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(com.stockmanagement.entity.RefreshToken::getUser)
                .map(user -> {
                    String token = jwtTokenProvider.generateTokenFromUsername(user.getUsername());
                    return ResponseEntity.ok(new com.stockmanagement.dto.TokenRefreshResponse(token, requestRefreshToken));
                })
                .orElseThrow(() -> new RuntimeException("Refresh token is not in database!"));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@jakarta.validation.Valid @RequestBody RegisterRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity.badRequest().body("Error: Username is already taken!");
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }

        // Create new user's account
        User user = new User();
        user.setUsername(signUpRequest.getUsername());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));
        user.setFirstName(signUpRequest.getFirstName());
        user.setLastName(signUpRequest.getLastName());

        UserRole role = signUpRequest.getRole();
        if (role == null) {
            role = UserRole.OPERATOR;
        }
        user.setRole(role);

        userRepository.save(user);

        return ResponseEntity.ok("User registered successfully!");
    }
}
