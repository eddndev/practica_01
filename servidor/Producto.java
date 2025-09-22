public class Producto {
    int id;
    String nombre;
    String descripcion;
    double precio;
    int stock;
    String rutaImagen;

    public Producto(int id, String nombre, String descripcion, double precio, int stock, String rutaImagen) {
        this.id = id;
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.precio = precio;
        this.stock = stock;
        this.rutaImagen = rutaImagen;
    }

    @Override
    public String toString() {
        return "ID: " + id + ", Nombre: " + nombre;
    }
}