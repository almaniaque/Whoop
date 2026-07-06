package com.whoopstack.devis.userAuth.config;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Locale;

import tools.jackson.core.JsonParser;
import tools.jackson.databind.DeserializationContext;
import tools.jackson.databind.deser.std.StdDeserializer;

public class FlexibleLocalDateDeserializer extends StdDeserializer<LocalDate> {

    private static final DateTimeFormatter ISO_FORMAT = DateTimeFormatter.ISO_LOCAL_DATE; // yyyy-MM-dd
    private static final DateTimeFormatter FR_FORMAT = DateTimeFormatter.ofPattern("dd MMMM yyyy", Locale.FRENCH);

    public FlexibleLocalDateDeserializer() {
        super(LocalDate.class);
    }

    @Override
    public LocalDate deserialize(JsonParser p, DeserializationContext ctxt) {
        String value = p.getString().trim();
        try {
            return LocalDate.parse(value, ISO_FORMAT);
        } catch (DateTimeParseException e) {
            return LocalDate.parse(value, FR_FORMAT);
        }
    }
}