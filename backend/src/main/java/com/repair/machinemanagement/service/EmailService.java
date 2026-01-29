package com.repair.machinemanagement.service;

import com.repair.machinemanagement.entity.Client;
import com.repair.machinemanagement.entity.Machine;
import com.repair.machinemanagement.exceptions.EmailSendException;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

/**
 * Service pour l'envoi d'emails aux clients.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.name:Machine Repair Management}")
    private String appName;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    /* ===================== CLIENT CREDENTIALS ===================== */

    @Async
    public void sendClientCredentials(Client client, String plainPassword) {
        try {
            Context context = new Context();
            context.setVariable("clientNom", client.getNom());
            context.setVariable("clientPrenom", client.getPrenom());
            context.setVariable("identifiant", client.getIdentifiant());
            context.setVariable("password", plainPassword);
            context.setVariable("appName", appName);
            context.setVariable("loginUrl", frontendUrl + "/client/login");

            String htmlContent = templateEngine.process("client-credentials", context);

            sendHtmlEmail(
                    client.getEmail(),
                    "Vos identifiants de connexion - " + appName,
                    htmlContent
            );

            log.info("Email d'identifiants envoyé à {}", client.getEmail());

        } catch (Exception e) {
            log.error("Échec envoi email identifiants à {} : {}",
                    client.getEmail(), e.getMessage());

            throw new EmailSendException(
                    "Impossible d'envoyer les identifiants au client",
                    e
            );
        }
    }

    /* ===================== MACHINE STATUS UPDATE ===================== */

    @Async
    public void sendMachineStatusUpdate(Client client, Machine machine) {
        try {
            Context context = new Context();
            context.setVariable("clientNom", client.getNom());
            context.setVariable("clientPrenom", client.getPrenom());
            context.setVariable("machineMarque", machine.getMarque());
            context.setVariable("machineModele", machine.getModele());
            context.setVariable("statut", getStatutLabel(machine.getStatut()));
            context.setVariable("appName", appName);
            context.setVariable("trackingUrl", frontendUrl + "/client/machines");

            String htmlContent = templateEngine.process("machine-status-update", context);

            sendHtmlEmail(
                    client.getEmail(),
                    "Mise à jour de votre machine - " + appName,
                    htmlContent
            );

            log.info("Email statut machine envoyé à {}", client.getEmail());

        } catch (Exception e) {
            log.error("Échec envoi email statut machine à {} : {}",
                    client.getEmail(), e.getMessage());

            throw new EmailSendException(
                    "Impossible d'envoyer la mise à jour de la machine",
                    e
            );
        }
    }

    /* ===================== MACHINE READY ===================== */

    @Async
    public void sendMachineReadyNotification(Client client, Machine machine) {
        try {
            Context context = new Context();
            context.setVariable("clientNom", client.getNom());
            context.setVariable("clientPrenom", client.getPrenom());
            context.setVariable("machineMarque", machine.getMarque());
            context.setVariable("machineModele", machine.getModele());
            context.setVariable("montant", machine.getMontant());
            context.setVariable("appName", appName);

            String htmlContent = templateEngine.process("machine-ready", context);

            sendHtmlEmail(
                    client.getEmail(),
                    "Votre machine est prête ! - " + appName,
                    htmlContent
            );

            log.info("Email machine prête envoyé à {}", client.getEmail());

        } catch (Exception e) {
            log.error("Échec envoi email machine prête à {} : {}",
                    client.getEmail(), e.getMessage());

            throw new EmailSendException(
                    "Impossible d'envoyer la notification machine prête",
                    e
            );
        }
    }

    /* ===================== CORE EMAIL ===================== */

    private void sendHtmlEmail(String to, String subject, String htmlContent)
            throws MessagingException {

        if (to == null || to.isBlank()) {
            throw new EmailSendException("Adresse email du destinataire invalide");
        }

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);

        mailSender.send(message);
    }

    /* ===================== UTIL ===================== */

    private String getStatutLabel(Machine.Statut statut) {
        return switch (statut) {
            case EN_ATTENTE -> "En attente";
            case EN_COURS -> "En cours de réparation";
            case TERMINE -> "Réparation terminée";
            case ANOMALIE -> "Anomalie détectée";
            case PAYE -> "Payé";
            case REMIS_AU_CLIENT -> "Remis au client";
        };
    }
}
