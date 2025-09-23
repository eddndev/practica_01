import java.util.List;

// Clase que modela la estructura completa de la respuesta JSON
public class ApiResponse {
    FilterData filters;
    List<Producto> products;

    public ApiResponse(FilterData filters, List<Producto> products) {
        this.filters = filters;
        this.products = products;
    }
}
