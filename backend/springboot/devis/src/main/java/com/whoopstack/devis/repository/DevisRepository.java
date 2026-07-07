package com.whoopstack.devis.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import com.whoopstack.devis.model.Devis;

public interface DevisRepository extends JpaRepository<Devis, Long> {
    // findAll(), findById(), save(), deleteById() sont déjà hérités !

    // @EntityGraph : Devis.client est en FetchType.LAZY et
    // spring.jpa.open-in-view=false. Sans ce chargement anticipé, la session
    // Hibernate est déjà fermée quand Jackson sérialise devis.client dans la
    // réponse JSON -> LazyInitializationException -> erreur 500 sur
    // GET /api/devis/... L'EntityGraph fait un JOIN et charge tout dans la
    // même requête SQL.
    //
    // ⚠️ "prestation" doit AUSSI être listé : un fetch graph rend LAZY tout
    // attribut absent de la liste, même déclaré EAGER dans l'entité. Avec
    // seulement "client", l'erreur 500 se déplace sur les prestations.
    @Override
    @EntityGraph(attributePaths = { "client", "prestation" })
    Optional<Devis> findById(Long id);

    @EntityGraph(attributePaths = { "client", "prestation" })
    List<Devis> findByUserId(Long userId);

    long countByUserId(Long userId);
}
