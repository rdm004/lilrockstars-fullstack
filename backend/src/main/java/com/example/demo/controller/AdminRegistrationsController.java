@RestController
@RequestMapping("/api/admin/registrations")
public class AdminRegistrationController {

    private final RegistrationRepository registrationRepository;

    public AdminRegistrationController(RegistrationRepository registrationRepository) {
        this.registrationRepository = registrationRepository;
    }

    @GetMapping
    public List<Registration> getAll() {
        return registrationRepository.findAll();
    }
}