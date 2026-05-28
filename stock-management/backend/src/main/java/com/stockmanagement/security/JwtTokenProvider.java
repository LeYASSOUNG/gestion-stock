package com.stockmanagement.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Fournisseur de jetons JWT.
 * Responsable de la génération, de la validation et de l'extraction des
 * informations des jetons.
 */
@Component
public class JwtTokenProvider {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private int jwtExpirationMs;

    /**
     * Génère un jeton JWT à partir de l'objet d'authentification.
     *
     * @param authentication objet d'authentification contenant l'utilisateur
     *                       principal
     * @return jeton JWT généré
     */
    public String generateJwtToken(Authentication authentication) {
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();

        return Jwts.builder()
                .subject(userPrincipal.getUsername())
                .issuedAt(new Date())
                .expiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(key(), Jwts.SIG.HS256)
                .compact();
    }

    public String generateTokenFromUsername(String username) {
        return Jwts.builder()
                .subject(username)
                .issuedAt(new Date())
                .expiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(key(), Jwts.SIG.HS256)
                .compact();
    }

    /**
     * Construit la clé de signature.
     * Essaie d'abord de décoder le secret en Base64, sinon utilise les bytes UTF-8.
     */
    private SecretKey key() {
        try {
            byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
            if (keyBytes.length >= 32) {
                return Keys.hmacShaKeyFor(keyBytes);
            }
        } catch (Exception e) {
            logger.warn("jwt.secret n'est pas une chaîne Base64 valide, utilisation des bytes UTF-8.");
        }
        // Fallback : utilise les bytes UTF-8 directement
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Extrait le nom d'utilisateur d'un jeton JWT.
     *
     * @param token jeton JWT
     * @return nom d'utilisateur
     */
    public String getUserNameFromJwtToken(String token) {
        return Jwts.parser()
                .verifyWith(key())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    /**
     * Valide un jeton JWT.
     *
     * @param authToken jeton JWT à valider
     * @return true si le jeton est valide, false sinon
     */
    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parser().verifyWith(key()).build().parse(authToken);
            return true;
        } catch (MalformedJwtException e) {
            logger.error("JWT invalide (malformé): {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("JWT expiré: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("JWT non supporté: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("JWT vide ou null: {}", e.getMessage());
        } catch (Exception e) {
            logger.error("Erreur validation JWT: {}", e.getMessage());
        }
        return false;
    }
}
