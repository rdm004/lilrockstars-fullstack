package com.example.demo.service;

import com.example.demo.model.Parent;
import com.example.demo.repository.ParentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ParentService {

    private final ParentRepository parentRepository;

    public ParentService(ParentRepository parentRepository) {
        this.parentRepository = parentRepository;
    }

    public List<Parent> getAllParents() {
        return parentRepository.findAll();
    }

    public Optional<Parent> getParentById(Long id) {
        return parentRepository.findById(id);
    }

    public Parent createParent(Parent parent) {
        return parentRepository.save(parent);
    }

    public void deleteParent(Long id) {
        parentRepository.deleteById(id);
    }
}