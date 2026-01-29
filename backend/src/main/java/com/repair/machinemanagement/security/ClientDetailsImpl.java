package com.repair.machinemanagement.security;

import com.repair.machinemanagement.entity.Client;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

/**
 * Implémentation de UserDetails pour les clients.
 */
@Data
@AllArgsConstructor
public class ClientDetailsImpl implements UserDetails {

    private Long id;
    private String identifiant;
    private String email;
    private String password;
    private String nom;
    private String prenom;
    private Boolean active;
    private Collection<? extends GrantedAuthority> authorities;

    public static ClientDetailsImpl build(Client client) {
        Collection<GrantedAuthority> authorities = Collections.singletonList(
            new SimpleGrantedAuthority("ROLE_CLIENT")
        );

        return new ClientDetailsImpl(
            client.getId(),
            client.getIdentifiant(),
            client.getEmail(),
            client.getPassword(),
            client.getNom(),
            client.getPrenom(),
            client.getActive(),
            authorities
        );
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return identifiant;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return active;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return active;
    }

    public String getRole() {
        return "CLIENT";
    }
}
