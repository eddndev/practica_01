public class Producto {
    int id;
    String nombre;
    String descripcion;
    double precio;
    int stock;
    String rutaImagen;
    String categoria;

    public Producto(int id, String nombre, String descripcion, double precio, int stock, String rutaImagen, String categoria) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.precio = precio;
        this.stock = stock;
        this.rutaImagen = rutaImagen;
        this.categoria = categoria;
    }

    // Convierte el producto a un formato similar al CSV para facil transmision
    @Override
    public String toString() {
        return id + "," + nombre + ",\"" + descripcion + "\"," + precio + "," + stock + "," + rutaImagen + "," + categoria;
    }
}