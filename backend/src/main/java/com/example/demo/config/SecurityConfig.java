package com.example.demo.config;

import com.example.demo.audit.AdminAuditFilter;
import com.example.demo.security.JwtAuthenticationFilter;
import com.example.demo.security.RestAuthEntryPoint;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final RestAuthEntryPoint restAuthEntryPoint;

    // ✅ NEW: audit filter for /api/admin/**
    private final AdminAuditFilter adminAuditFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                          RestAuthEntryPoint restAuthEntryPoint,
                          AdminAuditFilter adminAuditFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.restAuthEntryPoint = restAuthEntryPoint;
        this.adminAuditFilter = adminAuditFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                   CorsConfigurationSource corsConfigurationSource) throws Exception {

        http
                .cors(c -> c.configurationSource(corsConfigurationSource))
                .csrf(csrf -> csrf.disable())
                .exceptionHandling(e -> e.authenticationEntryPoint(restAuthEntryPoint))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        // ✅ Auth endpoints public
                        .requestMatchers("/api/auth/**").permitAll()

                        // ✅ Public GET for site
                        .requestMatchers(HttpMethod.GET,
                                "/api/races/**",
                                "/api/results/**",
                                "/api/sponsors/**",
                                "/api/photos/**",
                                "/api/gallery/**"
                        ).permitAll()

                        // ✅ Public POST (if you have these)
                        .requestMatchers(HttpMethod.POST,
                                "/api/contact/**",
                                "/api/public/**"
                        ).permitAll()

                        // ✅ Parent endpoints require login
                        .requestMatchers("/api/registrations/**").authenticated()
                        .requestMatchers("/api/racers/**").authenticated()
                        .requestMatchers("/api/parents/**").authenticated()
                        .requestMatchers("/api/parent/**").authenticated()

                        // ✅ Admin endpoints require ADMIN role ONLY
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // ✅ Anything else under /api requires login
                        .requestMatchers("/api/**").authenticated()

                        // allow React routes
                        .anyRequest().permitAll()
                );

        // ✅ JWT auth filter
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        // ✅ NEW: Admin audit logging (runs after JWT filter so user identity is available)
        http.addFilterAfter(adminAuditFilter, JwtAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource(
            @Value("${app.cors.allowed-origins:*}") String allowedOriginsProp) {

        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of(allowedOriginsProp.split(",")));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "X-Requested-With"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration cfg) throws Exception {
        return cfg.getAuthenticationManager();
    }
}