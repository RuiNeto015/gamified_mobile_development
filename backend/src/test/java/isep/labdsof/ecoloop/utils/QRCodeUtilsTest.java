package isep.labdsof.ecoloop.utils;

import isep.labdsof.ecoloop.dtos.QRCodeInfo;
import org.junit.jupiter.api.Test;

import java.text.ParseException;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

class QRCodeUtilsTest {

    @Test
    void testConvertQRStringValid() throws ParseException {
        // Construct a valid QR string
        Date date = new Date();
        String qrCodeString = "hash=123abc;expiresAt=" + date.getTime() + ";token=xyzToken";

        QRCodeInfo qrCodeInfo = QRCodeUtils.convertQRString(qrCodeString);

        // Assert the values are correctly parsed
        assertEquals("123abc", qrCodeInfo.getHash());
        assertEquals("xyzToken", qrCodeInfo.getToken());
        assertNotNull(qrCodeInfo.getExpiresAt()); // Ensure expiration date is parsed
    }

    @Test
    void testConvertQRStringInvalidFormat() {
        // Construct an invalid QR string with an incorrect key-value pair
        String qrCodeString = "hash=123abc;expiresAt=invalidDate;token=xyzToken";

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                QRCodeUtils.convertQRString(qrCodeString)
        );

        assertEquals("Invalid date format for expiresAt: invalidDate", exception.getMessage());
    }

    @Test
    void testConvertQRStringMissingFields() {
        // Construct a QR string missing required fields
        String qrCodeString = "hash=123abc;token=xyzToken";

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                QRCodeUtils.convertQRString(qrCodeString)
        );

        assertEquals("QR code string format is invalid", exception.getMessage());
    }

    @Test
    void testConvertQRStringNullOrEmpty() {
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                QRCodeUtils.convertQRString("")
        );

        assertEquals("QR code string cannot be null or empty", exception.getMessage());
    }

    @Test
    void testValidateQrCodeRequestNotExpired() {
        // Set an expiration date in the future
        QRCodeInfo qrCodeInfo = new QRCodeInfo();
        qrCodeInfo.setExpiresAt(new Date(System.currentTimeMillis() + 100000)); // Future date

        // No exception should be thrown
        QRCodeUtils.validateQrCodeRequest(qrCodeInfo);
    }

    @Test
    void testValidateQrCodeRequestExpired() {
        // Set an expiration date in the past
        QRCodeInfo qrCodeInfo = new QRCodeInfo();
        qrCodeInfo.setExpiresAt(new Date(System.currentTimeMillis() - 100000)); // Past date

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
                QRCodeUtils.validateQrCodeRequest(qrCodeInfo)
        );

        assertEquals("QR code request expired", exception.getMessage());
    }
}