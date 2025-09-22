import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.ArrayList;
import java.util.List;
import java.util.Scanner;
import java.util.stream.Collectors;

public class Servidor {

    private static List<Producto> inventario = new ArrayList<>();

    public static void main(String[] args){
        try{
            cargarProductos();
            System.out.println("Inventario cargado. " + inventario.size() + " productos en memoria.");

            ServerSocket s = new ServerSocket(1234);
            System.out.println("Servidor iniciado en el puerto " + s.getLocalPort());
            s.setReuseAddress(true);
            
            for(;;){
                Socket cl = s.accept();
                System.out.println("Cliente conectado desde " + cl.getInetAddress() + ":" + cl.getPort());
                PrintWriter pw = new PrintWriter(new OutputStreamWriter(cl.getOutputStream()));
                BufferedReader br = new BufferedReader(new InputStreamReader(cl.getInputStream()));
            
                // Lógica de ejemplo: Ignora la entrada del cliente y envía la lista de productos.
                String listaProductos = inventario.stream()
                                                  .map(p -> p.nombre)
                                                  .collect(Collectors.joining("; "));
                
                pw.println("Productos disponibles: " + listaProductos);
                pw.flush();

                br.close();
                pw.close();
                cl.close();
            }
        }catch(Exception e){
            e.printStackTrace();
        }
    }

    private static void cargarProductos() {
        try (Scanner scanner = new Scanner(new File("servidor/productos.csv"))) {
            if (scanner.hasNextLine()) {
                scanner.nextLine(); // Omitir la línea de encabezado
            }
            while (scanner.hasNextLine()) {
                String linea = scanner.nextLine();
                
                // Parsing manual para evitar problemas con regex y comas en la descripcion
                int primerDelim = linea.indexOf(',');
                int segundoDelim = linea.indexOf(',', primerDelim + 1);
                int ultimoDelim = linea.lastIndexOf(',');
                int penultimoDelim = linea.lastIndexOf(',', ultimoDelim - 1);
                int antepenultimoDelim = linea.lastIndexOf(',', penultimoDelim - 1);

                if (primerDelim > -1 && segundoDelim > -1 && ultimoDelim > -1 && penultimoDelim > -1 && antepenultimoDelim > -1) {
                    int id = Integer.parseInt(linea.substring(0, primerDelim));
                    String nombre = linea.substring(primerDelim + 1, segundoDelim);
                    String descripcion = linea.substring(segundoDelim + 1, antepenultimoDelim);
                    // Quitar comillas si existen
                    if (descripcion.startsWith("\"") && descripcion.endsWith("\"")) {
                        descripcion = descripcion.substring(1, descripcion.length() - 1);
                    }
                    double precio = Double.parseDouble(linea.substring(antepenultimoDelim + 1, penultimoDelim));
                    int stock = Integer.parseInt(linea.substring(penultimoDelim + 1, ultimoDelim));
                    String rutaImagen = linea.substring(ultimoDelim + 1);

                    inventario.add(new Producto(id, nombre, descripcion, precio, stock, rutaImagen));
                }
            }
        } catch (Exception e) {
            System.err.println("Error al cargar el archivo de productos: " + e.getMessage());
            e.printStackTrace();
        }
    }
}