package isep.labdsof.ecoloop.model;

import lombok.Data;

import java.util.List;

@Data
public class EcoMonthProgressDomain {

    private int year;

    private int month;

    private int monthEcoXp;

    private List<Level> levels;
}
