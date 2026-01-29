package com.repair.machinemanagement.security;

import com.repair.machinemanagement.entity.Client;
import com.repair.machinemanagement.exceptions.ResourceNotFoundException;
import com.repair.machinemanagement.exceptions.TokenExpiredException;
import com.repair.machinemanagement.repository.ClientRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;
    private final UserDetailsService userDetailsService;
    private final ClientRepository clientRepository;

    private static final String JWT_COOKIE_NAME = "auth_token";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        try {
            String jwt = getJwtFromRequest(request);

            if (!StringUtils.hasText(jwt)) {
                filterChain.doFilter(request, response);
                return;
            }

            if (!tokenProvider.validateToken(jwt)) {
                throw new TokenExpiredException("Token invalide ou expiré");
            }

            String username = tokenProvider.getUsernameFromToken(jwt);
            String type = tokenProvider.getTypeFromToken(jwt);

            UserDetails userDetails;

            if ("CLIENT".equals(type)) {
                Client client = clientRepository.findByEmail(username)
                        .orElseThrow(() ->
                                new ResourceNotFoundException("Client introuvable")
                        );
                userDetails = ClientDetailsImpl.build(client);
            } else {
                userDetails = userDetailsService.loadUserByUsername(username);
            }

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );

            authentication.setDetails(
                    new WebAuthenticationDetailsSource().buildDetails(request)
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

        } catch (TokenExpiredException ex) {
            SecurityContextHolder.clearContext();
            throw ex; // géré par CustomExceptionHandler
        } catch (Exception ex) {
            // aucune stacktrace volontairement
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Récupère le JWT depuis le header Authorization ou le cookie HttpOnly
     */
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }

        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if (JWT_COOKIE_NAME.equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }

        return null;
    }
}
