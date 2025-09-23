import java.util.Set;

// Clase simple para contener los datos de los filtros
public class FilterData {
    double minPrice;
    double maxPrice;
    Set<String> categories;

    public FilterData(double minPrice, double maxPrice, Set<String> categories) {
        this.minPrice = minPrice;
        this.maxPrice = maxPrice;
        this.categories = categories;
    }
}
