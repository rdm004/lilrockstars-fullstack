package com.example.demo.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/protected")
@CrossOrigin(origins = "*")
public class ProtectedController {

    @GetMapping("/test")
    public String testProtected() {
        return "JWT authorization working ✅";
    }
}