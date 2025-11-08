package com.example.demo.controller;

import com.example.demo.model.Parent;
import com.example.demo.model.ParentRacerLink;
import com.example.demo.model.Racer;
import com.example.demo.repository.ParentRacerLinkRepository;
import com.example.demo.repository.ParentRepository;
import com.example.demo.repository.RacerRepository;
import com.example.demo.security.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Locale;
import java.util.Optional;

@RestController
@RequestMapping("/api/parents")
public class ParentController {

    private final ParentRepository parentRepository;
    private final RacerRepository racerRepository;
    private final ParentRacerLinkRepository parentRacerLinkRepository;
    private final JwtUtil jwtUtil;

    public ParentController(ParentRepository parentRepository,
                            RacerRepository racerRepository,
                            ParentRacerLinkRepository parentRacerLinkRepository,
                            JwtUtil jwtUtil) {
        this.parentRepository = parentRepository;
        this.racerRepository = racerRepository;
        this.parentRacerLinkRepository = parentRacerLinkRepository;
        this.jwtUtil = jwtUtil;
    }

    // Simple request/response DTOs
    public record CoParentInviteRequest(String email) {}
    public record InviteResponse(String message) {}

    private Parent getCurrentParent(String authHeader) {
        String token = authHeader.substring(7); // remove "Bearer "
        String email = jwtUtil.extractUsername(token);
        return parentRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Parent not found for email " + email));
    }

    @PostMapping("/invite")
    public ResponseEntity<?> inviteCoParent(@RequestHeader("Authorization") String authHeader,
                                            @RequestBody CoParentInviteRequest request) {
        Parent inviter = getCurrentParent(authHeader);

        if (request.email() == null || request.email().isBlank()) {
            return ResponseEntity.badRequest().body(new InviteResponse("Email is required."));
        }

        String email = request.email().trim().toLowerCase(Locale.ROOT);

        // Prevent inviting yourself
        if (email.equalsIgnoreCase(inviter.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(new InviteResponse("You cannot invite yourself as a co-parent."));
        }

        // Co-parent must already have an account for now
        Optional<Parent> coParentOpt = parentRepository.findByEmail(email);
        if (coParentOpt.isEmpty()) {
            return ResponseEntity.status(404)
                    .body(new InviteResponse("No parent account found with that email. Ask them to register first."));
        }

        Parent coParent = coParentOpt.get();

        // Get all racers visible to the inviter (primary + any existing co-parent links)
        List<Racer> visibleRacers = racerRepository.findAllVisibleToParent(inviter);

        if (visibleRacers.isEmpty()) {
            return ResponseEntity.ok(new InviteResponse(
                    "You currently have no racers to share. Add a racer first, then invite your co-parent."
            ));
        }

        int linksCreated = 0;

        for (Racer racer : visibleRacers) {
            // Skip if coParent is already the primary parent
            if (racer.getParent() != null &&
                    racer.getParent().getId().equals(coParent.getId())) {
                continue;
            }

            // Skip if link already exists
            boolean exists = parentRacerLinkRepository.existsByParentAndRacer(coParent, racer);
            if (exists) {
                continue;
            }

            ParentRacerLink link = new ParentRacerLink(coParent, racer);
            parentRacerLinkRepository.save(link);
            linksCreated++;
        }

        String msg;
        if (linksCreated == 0) {
            msg = "This co-parent already has access to all your racers.";
        } else {
            msg = "Co-parent linked successfully! They can now view and manage your racers.";
        }

        return ResponseEntity.ok(new InviteResponse(msg));
    }
}