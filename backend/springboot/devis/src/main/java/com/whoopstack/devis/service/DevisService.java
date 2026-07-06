package com.whoopstack.devis.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.whoopstack.devis.model.Client;
import com.whoopstack.devis.model.Devis;
import com.whoopstack.devis.repository.ClientRepository;
import com.whoopstack.devis.repository.DevisRepository;
import com.whoopstack.devis.ressource.DevisClientDto;
import com.whoopstack.devis.userAuth.user.AppUser;
import com.whoopstack.devis.userAuth.user.AppUserRepository;

import org.springframework.transaction.annotation.Transactional;

@Service
public class DevisService {

    private final DevisRepository repository;
    private final AppUserRepository appUserRepository;
    private final ClientRepository clientRepository;

    public DevisService(DevisRepository repository,
            AppUserRepository appUserRepository,
            ClientRepository clientRepository) {
        this.repository = repository;
        this.appUserRepository = appUserRepository;
        this.clientRepository = clientRepository;
    }

    public List<Devis> getAllDevis(Long userId) {
        return repository.findByUserId(userId); // le devis est conneter au freelance
    }

    public Devis getDevisById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Devis introuvable avec l'id : " + id));
    }

    public Devis addDevis(Long userId, Long clientId, Devis devis) {
        // ajout de la partie user
        AppUser user = appUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client introuvable"));

        if (!client.getUser().getId().equals(userId)) {
            throw new RuntimeException("Ce client n'appartient pas à cet utilisateur");
        }

        devis.setUser(user);
        devis.setClient(client);

        return repository.save(devis);
    }

    public Devis updateDevisById(Long id, Devis devisModifie) {
        Devis devis = getDevisById(id);

        devis.setCategorie(devisModifie.getCategorie());
        devis.setDate(devisModifie.getDate());
        devis.setEcheance(devisModifie.getEcheance());
        devis.setClient(devisModifie.getClient());
        devis.setStatut(devisModifie.getStatut());
        return repository.save(devis);
    }

    public void deleteDevis(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Devis introuvable avec l'id : " + id);
        }
        repository.deleteById(id);
    }

    // affichage des devis dans l'oglet du client
    @Transactional(readOnly = true)
    public List<DevisClientDto> getDevisByUserAndClient(Long userId, Long clientId) {

        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Client introuvable avec l'id : " + clientId));

        if (client.getUser() == null || !client.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Ce client n'appartient pas à cet utilisateur");
        }

        return repository.findByUserIdAndClientId(userId, clientId)
                .stream()
                .map(devis -> new DevisClientDto(
                        devis.getId(),
                        devis.getCategorie(),
                        devis.getDate(),
                        devis.getEcheance(),
                        calculerMontantDevis(devis),
                        devis.getStatut()))
                .toList();
    }

    private int calculerMontantDevis(Devis devis) {
        if (devis.getPrestation() == null) {
            return 0;
        }

        return devis.getPrestation()
                .stream()
                .mapToInt(prestation -> prestation.getMontant() * prestation.getQuantite())
                .sum();
    }
}
