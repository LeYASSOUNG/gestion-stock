package com.stockmanagement.config;

import com.stockmanagement.entity.User;
import com.stockmanagement.entity.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Initialiseur de données au démarrage de l'application.
 * Crée un utilisateur administrateur par défaut si la base de données est vide.
 */
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final com.stockmanagement.repository.UserRepository userRepository;
    private final com.stockmanagement.repository.WarehouseRepository warehouseRepository;
    private final com.stockmanagement.repository.SupplierRepository supplierRepository;
    private final com.stockmanagement.repository.CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Créer un administrateur par défaut
        if (userRepository.count() == 0) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setEmail("admin@stockmanagement.com");
            admin.setFirstName("Admin");
            admin.setLastName("System");
            admin.setRole(UserRole.ADMIN);
            admin.setActive(true);
            userRepository.save(admin);
            System.out.println("Default admin user created: admin / admin123");
        }

        // Créer un entrepôt par défaut
        if (warehouseRepository.count() == 0) {
            com.stockmanagement.entity.Warehouse wh = new com.stockmanagement.entity.Warehouse();
            wh.setCode("WH-MAIN");
            wh.setName("Entrepôt Principal");
            wh.setLocation("Paris");
            wh.setAddress("123 Rue de la Logistique, 75000 Paris");
            wh.setManager("Jean Dupont");
            wh.setActive(true);
            warehouseRepository.save(wh);
            System.out.println("Default warehouse created: WH-MAIN");
        }

        // Créer un fournisseur par défaut
        if (supplierRepository.count() == 0) {
            com.stockmanagement.entity.Supplier sup = new com.stockmanagement.entity.Supplier();
            sup.setName("Fournisseur Global");
            sup.setContactPerson("Alice Martin");
            sup.setEmail("contact@global-sup.com");
            sup.setPhone("+33 1 23 45 67 89");
            sup.setAddress("45 Avenue des Fournisseurs, 69000 Lyon");
            sup.setActive(true);
            supplierRepository.save(sup);
            System.out.println("Default supplier created: Fournisseur Global");
        }

        // Créer quelques catégories de base
        if (categoryRepository.count() == 0) {
            com.stockmanagement.entity.Category cat1 = new com.stockmanagement.entity.Category();
            cat1.setName("Électronique");
            cat1.setDescription("Produits électroniques et gadgets");
            categoryRepository.save(cat1);

            com.stockmanagement.entity.Category cat2 = new com.stockmanagement.entity.Category();
            cat2.setName("Fournitures de bureau");
            cat2.setDescription("Matériel de bureau et papeterie");
            categoryRepository.save(cat2);

            System.out.println("Base categories created: Électronique, Fournitures de bureau");
        }
    }
}
