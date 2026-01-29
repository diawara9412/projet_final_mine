package com.repair.machinemanagement.util;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * Convertisseur JPA pour chiffrer/déchiffrer automatiquement les colonnes sensibles.
 * Utilise @Convert(converter = EncryptedStringConverter.class) sur les champs.
 */
@Converter
@Component
public class EncryptedStringConverter implements AttributeConverter<String, String> {

    private static AESEncryptionUtil aesEncryptionUtil;

    @Autowired
    public void setAesEncryptionUtil(AESEncryptionUtil util) {
        EncryptedStringConverter.aesEncryptionUtil = util;
    }

    @Override
    public String convertToDatabaseColumn(String attribute) {
        if (attribute == null || aesEncryptionUtil == null) {
            return attribute;
        }
        return aesEncryptionUtil.encrypt(attribute);
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        if (dbData == null || aesEncryptionUtil == null) {
            return dbData;
        }
        return aesEncryptionUtil.decrypt(dbData);
    }
}
