package com.whoopstack.devis.service;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.whoopstack.devis.model.Client;
import com.whoopstack.devis.repository.ClientRepository;
import com.whoopstack.devis.userAuth.user.AppUser;
import com.whoopstack.devis.userAuth.user.AppUserRepository;

@Service
public class ClientService {

    private final ClientRepository repository;
    private final AppUserRepository appUserRepository;

    public ClientService(ClientRepository repository, AppUserRepository appUserRepository) {
        this.repository = repository;
        this.appUserRepository = appUserRepository;
    }

    public List<Client> getClientsByUserId(Long userId) {
        return repository.findByUserId(userId);
    }

    public Optional<Client> getClientById(Long id) {
        return repository.findById(id);
    }

public Client updateClient(Long id, Client clientDetails) {

    Client existingClient = repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Client introuvable avec l'id : " + id
            ));

    existingClient.setName(clientDetails.getName());
    existingClient.setEmail(clientDetails.getEmail());
    existingClient.setTelephone(clientDetails.getTelephone());
    existingClient.setEntreprise(clientDetails.getEntreprise());
    existingClient.setVille(clientDetails.getVille());

    return repository.save(existingClient);
    }

    public Client createClient(Long userId, Client client) {
        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        client.setUser(user);
        return repository.save(client);

    }

    public boolean deleteClient(Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return true;
        }
        return false;
    }

}
