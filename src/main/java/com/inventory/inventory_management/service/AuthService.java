package com.inventory.inventory_management.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.inventory.inventory_management.entity.User;
import com.inventory.inventory_management.repository.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Used by DataInitializer to create Admin/Employee accounts
    public User createUser(
            String username,
            String password,
            String role) {

        User user = new User();

        user.setUsername(username);
        user.setPassword(
                passwordEncoder.encode(password)
        );
        user.setRole(role);

        return userRepository.save(user);
    }

    // Registration from the application
    // New users are always EMPLOYEE
    public User register(User user) {

        user.setRole("EMPLOYEE");

        user.setPassword(
                passwordEncoder.encode(
                        user.getPassword()
                )
        );

        return userRepository.save(user);
    }

    // Login
    public User login(
            String username,
            String password) {

        User user = userRepository
                .findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Invalid username or password"
                        )
                );

        if (!passwordEncoder.matches(
                password,
                user.getPassword())) {

            throw new RuntimeException(
                    "Invalid username or password"
            );
        }

        return user;
    }
}