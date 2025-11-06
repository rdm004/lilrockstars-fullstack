package com.example.demo.controller;

import com.example.demo.model.Registration;
import com.example.demo.repository.RegistrationRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/registrations")
public class RegistrationController {

    private final RegistrationRepository registrationRepository;

    public RegistrationController(RegistrationRepository registrationRepository) {
        this.registrationRepository = registrationRepository;
    }

    @GetMapping
    public List<Registration> getAllRegistrations() {
        return registrationRepository.findAll();
    }

    @PostMapping
    public Registration addRegistration(@RequestBody Registration registration) {
        return registrationRepository.save(registration);
    }
}