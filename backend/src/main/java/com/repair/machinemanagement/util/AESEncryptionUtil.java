package com.repair.machinemanagement.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Utilitaire de chiffrement AES-GCM pour les données sensibles.
 * Utilise AES-256-GCM pour un chiffrement authentifié.
 * Clé attendue en Base64 (pas hexadécimale).
 */
@Component
public class AESEncryptionUtil {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12; // 96 bits
    private static final int GCM_TAG_LENGTH = 128; // 128 bits

    @Value("${encryption.aes.secret-key}")
    private String secretKey; // attend une clé Base64

    /**
     * Chiffre une chaîne de caractères avec AES-GCM.
     * @param plainText Le texte en clair à chiffrer
     * @return Le texte chiffré encodé en Base64
     */
    public String encrypt(String plainText) {
        if (plainText == null || plainText.isEmpty()) {
            return plainText;
        }

        try {
            byte[] keyBytes = Base64.getDecoder().decode(secretKey); // clé Base64
            SecretKeySpec keySpec = new SecretKeySpec(keyBytes, "AES");

            // Générer un IV aléatoire
            byte[] iv = new byte[GCM_IV_LENGTH];
            new SecureRandom().nextBytes(iv);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.ENCRYPT_MODE, keySpec, parameterSpec);

            byte[] encryptedBytes = cipher.doFinal(plainText.getBytes("UTF-8"));

            // Combiner IV + données chiffrées
            ByteBuffer byteBuffer = ByteBuffer.allocate(iv.length + encryptedBytes.length);
            byteBuffer.put(iv);
            byteBuffer.put(encryptedBytes);

            return Base64.getEncoder().encodeToString(byteBuffer.array());
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors du chiffrement", e);
        }
    }

    /**
     * Déchiffre une chaîne de caractères avec AES-GCM.
     * @param encryptedText Le texte chiffré encodé en Base64
     * @return Le texte en clair
     */
    public String decrypt(String encryptedText) {
        if (encryptedText == null || encryptedText.isEmpty()) {
            return encryptedText;
        }

        try {
            // Check if the string is valid Base64 before attempting to decrypt
            // If it contains characters not in Base64 alphabet, it's likely unencrypted
            if (!isValidBase64(encryptedText)) {
                // Return as-is if not valid Base64 (likely unencrypted data)
                return encryptedText;
            }
            
            byte[] keyBytes = Base64.getDecoder().decode(secretKey); // clé Base64
            SecretKeySpec keySpec = new SecretKeySpec(keyBytes, "AES");

            byte[] encryptedData = Base64.getDecoder().decode(encryptedText);

            // Extraire IV et données chiffrées
            ByteBuffer byteBuffer = ByteBuffer.wrap(encryptedData);
            byte[] iv = new byte[GCM_IV_LENGTH];
            byteBuffer.get(iv);
            byte[] cipherText = new byte[byteBuffer.remaining()];
            byteBuffer.get(cipherText);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.DECRYPT_MODE, keySpec, parameterSpec);

            byte[] decryptedBytes = cipher.doFinal(cipherText);
            return new String(decryptedBytes, "UTF-8");
        } catch (IllegalArgumentException e) {
            // If Base64 decoding fails, return the original text (likely unencrypted)
            return encryptedText;
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors du déchiffrement", e);
        }
    }

    /**
     * Vérifie si une chaîne est un Base64 valide
     */
    private boolean isValidBase64(String str) {
        // Base64 only contains A-Z, a-z, 0-9, +, /, and = for padding
        return str.matches("^[A-Za-z0-9+/]*={0,2}$");
    }

    /**
     * Génère une clé AES-256 aléatoire en Base64.
     * @return Clé Base64 de 256 bits
     */
    public static String generateBase64Key() {
        byte[] key = new byte[32]; // 256 bits
        new SecureRandom().nextBytes(key);
        return Base64.getEncoder().encodeToString(key);
    }

    /**
     * Méthode main pour générer une clé Base64 de test.
     */
    public static void main(String[] args) {
        System.out.println("Generated AES-256 Base64 Key: " + generateBase64Key());
    }
}
