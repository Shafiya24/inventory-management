package com.inventory.inventory_management.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.*;

import com.inventory.inventory_management.entity.User;
import com.inventory.inventory_management.service.AuthService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.util.Collections;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(
    origins = "http://localhost:5173",
    allowCredentials = "true"
)
public class AuthController {

    private final AuthService authService;

    private final SecurityContextRepository securityContextRepository =
            new HttpSessionSecurityContextRepository();

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // =========================
    // LOGIN
    // =========================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody User loginUser,
            HttpServletRequest request,
            HttpServletResponse response) {

        try {

            User user = authService.login(
                    loginUser.getUsername(),
                    loginUser.getPassword()
            );

            String role = user.getRole();

            if (!role.startsWith("ROLE_")) {
                role = "ROLE_" + role;
            }

            Authentication authentication =
                    new UsernamePasswordAuthenticationToken(
                            user.getUsername(),
                            null,
                            Collections.singletonList(
                                    new SimpleGrantedAuthority(role)
                            )
                    );

            SecurityContext context =
                    SecurityContextHolder.createEmptyContext();

            context.setAuthentication(authentication);

            SecurityContextHolder.setContext(context);

            securityContextRepository.saveContext(
                    context,
                    request,
                    response
            );

            HttpSession session = request.getSession(true);

            session.setAttribute("userId", user.getId());
            session.setAttribute("username", user.getUsername());
            session.setAttribute("role", user.getRole());

            return ResponseEntity.ok(user);

        } catch (Exception e) {

            return ResponseEntity
                    .status(401)
                    .body("Invalid username or password");
        }
    }

    // =========================
    // REGISTER
    // =========================

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody User user) {

        try {

            User createdUser =
                    authService.register(user);

            return ResponseEntity
                    .status(201)
                    .body(createdUser);

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =========================
    // LOGOUT
    // =========================

    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            HttpServletRequest request) {

        SecurityContextHolder.clearContext();

        HttpSession session = request.getSession(false);

        if (session != null) {
            session.invalidate();
        }

        return ResponseEntity.ok(
                "Logged out successfully"
        );
    }

    // =========================
    // CURRENT USER
    // =========================

    @GetMapping("/me")
    public ResponseEntity<?> currentUser(
            HttpSession session) {

        Object userId =
                session.getAttribute("userId");

        if (userId == null) {

            return ResponseEntity
                    .status(401)
                    .body("Not logged in");
        }

        return ResponseEntity.ok(
                new UserSessionResponse(
                        session.getAttribute("userId"),
                        session.getAttribute("username"),
                        session.getAttribute("role")
                )
        );
    }

    // =========================
    // SESSION RESPONSE
    // =========================

    public static class UserSessionResponse {

        private final Object id;
        private final Object username;
        private final Object role;

        public UserSessionResponse(
                Object id,
                Object username,
                Object role) {

            this.id = id;
            this.username = username;
            this.role = role;
        }

        public Object getId() {
            return id;
        }

        public Object getUsername() {
            return username;
        }

        public Object getRole() {
            return role;
        }
    }
}