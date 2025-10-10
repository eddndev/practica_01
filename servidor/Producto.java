public class Producto {
    // Este es un POJO (Plain Old Java Object).
    // Gson lo convertira a JSON automaticamente.
    int id;
    String nombre;
    String descripcion;
    double precio;
    int stock;
    String rutaImagen;
    String categoria;
    int quantity;

    public Producto(int id, String nombre, String descripcion, double precio, int stock, String rutaImagen, String categoria) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.precio = precio;
        this.stock = stock;
        this.rutaImagen = rutaImagen;
        this.categoria = categoria;
    }

    // toString() ya no se usa para la respuesta, pero es util para debugging.
    @Override
    public String toString() {
        return "ID: " + id + ", Nombre: " + nombre;
    }
}