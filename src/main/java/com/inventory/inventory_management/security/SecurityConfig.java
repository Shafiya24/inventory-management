package com.inventory.inventory_management.security;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration)
            throws Exception {

        return configuration.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        configuration.setAllowedOrigins(
                Arrays.asList("http://localhost:5173")
        );

        configuration.setAllowedMethods(
                Arrays.asList(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                Arrays.asList("*")
        );

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())

            .cors(cors ->
                cors.configurationSource(
                    corsConfigurationSource()
                )
            )

            .authorizeHttpRequests(auth -> auth

                // LOGIN / REGISTER
                .requestMatchers("/api/auth/**")
                .permitAll()

                // READ DATA
                .requestMatchers(
                    HttpMethod.GET,
                    "/api/products/**",
                    "/api/categories/**",
                    "/api/suppliers/**",
                    "/api/purchases/**",
                    "/api/sales/**",
                    "/api/stock/**"
                )
                .permitAll()

                // CREATE / UPDATE
               
             // CREATE inventory data
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/products/**",
                    "/api/categories/**",
                    "/api/suppliers/**",
                    "/api/purchases/**",
                    "/api/sales/**",
                    "/api/stock/**"
                )
                .permitAll()
                
                .requestMatchers(
                	    HttpMethod.PUT,
                	    "/api/products/**",
                	    "/api/categories/**",
                	    "/api/suppliers/**",
                	    "/api/purchases/**",
                	    "/api/sales/**",
                	    "/api/stock/**"
                	)
                	.permitAll()

                // DELETE = ADMIN ONLY
                .requestMatchers(
                    HttpMethod.DELETE,
                    "/api/products/**",
                    "/api/categories/**",
                    "/api/suppliers/**"
                )
                .hasRole("ADMIN")

                .anyRequest()
                .permitAll()
            )

            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.IF_REQUIRED
                )
            );

        return http.build();
    }
}