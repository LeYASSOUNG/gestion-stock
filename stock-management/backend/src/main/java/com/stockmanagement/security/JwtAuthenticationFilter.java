package com.stockmanagement.security;

import com.stockmanagement.service.UserDetailsServiceImpl;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filtre de sécurité qui s'exécute pour chaque requête.
 * Il extrait le jeton JWT de l'en-tête Authorization, le valide et définit
 * l'authentification
 * dans le contexte de sécurité de Spring si le jeton est valide.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsServiceImpl userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        System.out.println("DEBUG: Request received in Filter: " + request.getMethod() + " " + request.getRequestURI());
        try {
            String jwt = parseJwt(request);
            if (jwt != null) {
                System.out.println("DEBUG: JWT found in request");
                if (jwtTokenProvider.validateJwtToken(jwt)) {
                    String username = jwtTokenProvider.getUserNameFromJwtToken(jwt);
                    System.out.println("DEBUG: Valid JWT for user: " + username);

                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                } else {
                    System.out.println("DEBUG: Invalid JWT token");
                }
            } else {
                System.out.println("DEBUG: No JWT token found in headers");
            }
        } catch (Exception e) {
            System.out.println("DEBUG: Error in Filter: " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");

        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }

        return null;
    }
}
