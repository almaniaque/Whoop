package com.whoopstack.devis.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.whoopstack.devis.model.Client;

public interface ClientRepository extends JpaRepository<Client, Long> {

    // findAll(), findById(), save(), deleteById() sont déjà hérités !
    List<Client> findByUserId(Long userId);

    Optional<Client> findById(Long id);
}
