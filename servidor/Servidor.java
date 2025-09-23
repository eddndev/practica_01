import com.google.gson.Gson;
import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Scanner;
import java.util.Set;
import java.util.stream.Collectors;

public class Servidor {

    private static List<Producto> inventario = new ArrayList<>();
    private static FilterData filterData;
    private static final Gson gson = new Gson();

    public static void main(String[] args){
        try{
            cargarProductos();
            calcularFiltros();
            System.out.println("Inventario cargado y filtros calculados.");

            ServerSocket s = new ServerSocket(8000, 50, java.net.InetAddress.getByName("localhost"));
            System.out.println("Servidor JSON iniciado en el puerto " + s.getLocalPort());
            s.setReuseAddress(true);
            
            for(;;){
                Socket cl = null;
                try {
                    cl = s.accept();
                    System.out.println("Cliente conectado desde " + cl.getInetAddress() + ":" + cl.getPort());
                    
                    PrintWriter pw = new PrintWriter(new OutputStreamWriter(cl.getOutputStream()));
                    BufferedReader br = new BufferedReader(new InputStreamReader(cl.getInputStream()));

                    String command = br.readLine();
                    System.out.println("Comando recibido: " + command);

                    List<Producto> productosFiltrados = new ArrayList<>(inventario);

                    if (command != null) {
                        if (command.startsWith("GET_CATEGORY:")) {
                            String categoria = command.substring(13);
                            productosFiltrados = inventario.stream()
                                .filter(p -> p.categoria.equalsIgnoreCase(categoria))
                                .collect(Collectors.toList());
                        } else if (!command.equals("GET_ALL")) {
                            // Si no es GET_ALL o GET_CATEGORY, no devolvemos productos.
                            productosFiltrados.clear(); 
                        }
                    }

                    ApiResponse response = new ApiResponse(filterData, productosFiltrados);
                    String jsonResponse = gson.toJson(response);
                    pw.println(jsonResponse);
                    pw.flush();

                } catch (Exception e) {
                    System.err.println("Error manejando al cliente: " + e.getMessage());
                } finally {
                    if (cl != null && !cl.isClosed()) {
                        try { cl.close(); } catch (Exception e) { /* Ignorar */ }
                    }
                }
            }
        }catch(Exception e){
            e.printStackTrace();
        }
    }

    private static void calcularFiltros() {
        if (inventario.isEmpty()) return;
        double minPrice = inventario.stream().min(Comparator.comparing(p -> p.precio)).get().precio;
        double maxPrice = inventario.stream().max(Comparator.comparing(p -> p.precio)).get().precio;
        Set<String> categories = inventario.stream().map(p -> p.categoria).collect(Collectors.toSet());
        filterData = new FilterData(minPrice, maxPrice, categories);
    }

    private static void cargarProductos() {
        // ... (El resto del metodo cargarProductos no necesita cambios)
        try (Scanner scanner = new Scanner(new File("servidor/productos.csv"))) {
            if (scanner.hasNextLine()) { scanner.nextLine(); }
            while (scanner.hasNextLine()) {
                String linea = scanner.nextLine();
                int d1 = linea.indexOf(',');
                int d2 = linea.indexOf(',', d1 + 1);
                int d7 = linea.lastIndexOf(',');
                int d6 = linea.lastIndexOf(',', d7 - 1);
                int d5 = linea.lastIndexOf(',', d6 - 1);
                int d4 = linea.lastIndexOf(',', d5 - 1);
                if (d1 > -1 && d2 > -1 && d4 > -1 && d5 > -1 && d6 > -1 && d7 > -1) {
                    int id = Integer.parseInt(linea.substring(0, d1));
                    String nombre = linea.substring(d1 + 1, d2);
                    String descripcion = linea.substring(d2 + 1, d4);
                    if (descripcion.startsWith("\"") && descripcion.endsWith("\"")) {
                        descripcion = descripcion.substring(1, descripcion.length() - 1);
                    }
                    double precio = Double.parseDouble(linea.substring(d4 + 1, d5));
                    int stock = Integer.parseInt(linea.substring(d5 + 1, d6));
                    String rutaImagen = linea.substring(d6 + 1, d7);
                    String categoria = linea.substring(d7 + 1);
                    inventario.add(new Producto(id, nombre, descripcion, precio, stock, rutaImagen, categoria));
                }
            }
        } catch (Exception e) {
            System.err.println("Error al cargar el archivo de productos: " + e.getMessage());
            e.printStackTrace();
        }
    }
}