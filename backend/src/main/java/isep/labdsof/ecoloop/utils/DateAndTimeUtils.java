package isep.labdsof.ecoloop.utils;

import org.springframework.data.util.Pair;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;

public class DateAndTimeUtils {

    public static Date convertIso8601ToDate(String string) throws ParseException {
        DateFormat df = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss SSSZ");
        return df.parse(string);
    }

    public static Date convertTimestampToDate(String timestamp) throws ParseException {
        try {
            long timestampLong = Long.parseLong(timestamp);
            return new Date(timestampLong);
        } catch (NumberFormatException e) {
            throw new ParseException("Failed to parse timestamp: " + timestamp, 0);
        }
    }

    public static boolean isSameDay(Date date1, Date date2) {
        if (date1 == null || date2 == null) {
            return false;
        }

        Calendar cal1 = Calendar.getInstance();
        Calendar cal2 = Calendar.getInstance();
        cal1.setTime(date1);
        cal2.setTime(date2);

        return cal1.get(Calendar.YEAR) == cal2.get(Calendar.YEAR) &&
               cal1.get(Calendar.MONTH) == cal2.get(Calendar.MONTH) &&
               cal1.get(Calendar.DAY_OF_MONTH) == cal2.get(Calendar.DAY_OF_MONTH);
    }

    public static Pair<Integer, Integer> getYearAndMonth() {
        Calendar calendar = Calendar.getInstance();
        Date currentDate = new Date();
        calendar.setTime(currentDate);

        int year = calendar.get(Calendar.YEAR);
        int month = calendar.get(Calendar.MONTH) + 1; // Because january is 0

        return Pair.of(year, month);
    }

}