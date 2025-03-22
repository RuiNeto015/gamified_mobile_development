package isep.labdsof.ecoloop.utils;

import isep.labdsof.ecoloop.dtos.QRCodeInfo;

import java.text.ParseException;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

public class QRCodeUtils {

    public static QRCodeInfo convertQRString(String qrCodeString) {
        if (qrCodeString == null || qrCodeString.isEmpty()) {
            throw new IllegalArgumentException("QR code string cannot be null or empty");
        }

        Map<String, String> qrParts = new HashMap<>();
        String[] pairs = qrCodeString.split(";");

        for (String pair : pairs) {
            String[] keyValue = pair.split("=");
            if (keyValue.length != 2) {
                throw new IllegalArgumentException("QR code string format is invalid");
            }
            qrParts.put(keyValue[0].trim(), keyValue[1].trim());
        }

        if (!qrParts.containsKey("hash") || !qrParts.containsKey("expiresAt") || !qrParts.containsKey("token")) {
            throw new IllegalArgumentException("QR code string format is invalid");
        }

        // Extract and validate each field
        String hash = qrParts.get("hash");
        String expiresAtStr = qrParts.get("expiresAt");
        String token = qrParts.get("token");
        Date date;

        try {
            date = DateAndTimeUtils.convertTimestampToDate(expiresAtStr);
        } catch (ParseException e) {
            throw new IllegalArgumentException("Invalid date format for expiresAt: " + expiresAtStr);
        }

        QRCodeInfo qrCodeRequest = new QRCodeInfo();
        qrCodeRequest.setHash(hash);
        qrCodeRequest.setExpiresAt(date);
        qrCodeRequest.setToken(token);

        return qrCodeRequest;
    }

    public static void validateQrCodeRequest(QRCodeInfo qrCodeRequest) {
        if (qrCodeRequest.getExpiresAt().before(new Date())) {
            throw new IllegalArgumentException("QR code request expired");
        }

        // todo: verify the integrity of the payload with the hash and signature
    }
}


