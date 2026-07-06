package com.whoopstack.devis.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.whoopstack.devis.model.Client;
import com.whoopstack.devis.service.ClientService;

@RestController
@RequestMapping("/api/clients")
@CrossOrigin(origins = "http://localhost:4200")
public class ClientController {
    private final ClientService clientService;

    public ClientController(ClientService clientService) {
        this.clientService = clientService;
    }

    @GetMapping("/users/{userId}/clients")
    public List<Client> getClientsByUserId(@PathVariable Long userId) {
        return clientService.getClientsByUserId(userId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Client> getClientById(@PathVariable Long id) {
        Optional<Client> client = clientService.getClientById(id);

        if (client.isPresent()) {
            return ResponseEntity.ok(client.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{id}")
public ResponseEntity<Client> updateClient(@PathVariable Long id, @RequestBody Client client) {
    Client updatedClient = clientService.updateClient(id, client);
    return ResponseEntity.ok(updatedClient);
}

    @PostMapping("/users/{userId}/clients")
    public Client createClient(@PathVariable Long userId, @RequestBody Client client) {
        return clientService.createClient(userId, client);
    }

    @DeleteMapping("/{id}")
    public void deleteClient(@PathVariable Long id) {
        clientService.deleteClient(id);
    }

}
