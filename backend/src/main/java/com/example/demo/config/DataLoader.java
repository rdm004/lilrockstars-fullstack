package com.example.demo.config;

import com.example.demo.model.Sponsor;
import com.example.demo.repository.SponsorRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner initSponsors(SponsorRepository sponsorRepository) {
        return args -> {
            if (sponsorRepository.count() == 0) {
                sponsorRepository.save(new Sponsor(
                        "Speedy Tires",
                        "/images/sponsors/speedy.png",
                        "https://speedytires.com",
                        "Official tire partner of Lil Rockstars Racing."
                ));
                sponsorRepository.save(new Sponsor(
                        "FuelZone Energy Drink",
                        "/images/sponsors/fuelzone.png",
                        "https://fuelzoneenergy.com",
                        "Powering racers with energy and focus."
                ));
                sponsorRepository.save(new Sponsor(
                        "RockFish Speedway",
                        "/images/sponsors/rockfish.png",
                        "https://rockfishspeedway.com",
                        "Home of the Lil Rockstars events."
                ));
            }
        };
    }
}