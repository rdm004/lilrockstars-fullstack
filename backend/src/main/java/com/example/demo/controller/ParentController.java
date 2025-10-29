package com.example.demo.controller;

import com.example.demo.model.Parent;
import com.example.demo.service.ParentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/parents")
@CrossOrigin(origins = "*")
public class ParentController {

    private final ParentService parentService;

    public ParentController(ParentService parentService) {
        this.parentService = parentService;
    }

    @GetMapping
    public List<Parent> getAllParents() {
        return parentService.getAllParents();
    }

    @GetMapping("/{id}")
    public Optional<Parent> getParentById(@PathVariable Long id) {
        return parentService.getParentById(id);
    }

    @PostMapping
    public Parent createParent(@RequestBody Parent parent) {
        return parentService.createParent(parent);
    }

    @DeleteMapping("/{id}")
    public void deleteParent(@PathVariable Long id) {
        parentService.deleteParent(id);
    }
}