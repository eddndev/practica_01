import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
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
import java.io.OutputStream;
import java.nio.file.Files;
import java.io.IOException;
import java.io.FileWriter;
import java.lang.reflect.Type;
import java.util.Map;
import java.util.HashMap;

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
                    
                    BufferedReader br = new BufferedReader(new InputStreamReader(cl.getInputStream()));
                    String command = br.readLine();
                    System.out.println("Comando recibido: " + command);

                    if (command != null) {
                        if (command.startsWith("GET_IMAGE:")) {
                            String imagePath = command.substring(10).replace("/", File.separator);
                            File imageFile = new File("servidor" + File.separator + "public" + File.separator + imagePath);
                            
                            if (imageFile.exists() && !imageFile.isDirectory()) {
                                System.out.println("Enviando imagen: " + imageFile.getPath());
                                try (OutputStream out = cl.getOutputStream()) {
                                    Files.copy(imageFile.toPath(), out);
                                    out.flush();
                                } catch (IOException e) {
                                    System.err.println("Error al enviar imagen: " + e.getMessage());
                                }
                            } else {
                                System.err.println("Imagen no encontrada: " + imageFile.getPath());
                                cl.close();
                            }
                        } else if (command.startsWith("BUY:")) {
                            String jsonCart = command.substring(4);
                            handlePurchase(jsonCart, cl);
                        } else {
                            PrintWriter pw = new PrintWriter(new OutputStreamWriter(cl.getOutputStream()));
                            List<Producto> productosFiltrados = new ArrayList<>(inventario);

                            if (command.startsWith("GET_CATEGORY:")) {
                                String categoria = command.substring(13);
                                productosFiltrados = inventario.stream()
                                    .filter(p -> p.categoria.equalsIgnoreCase(categoria))
                                    .collect(Collectors.toList());
                            } else if (!command.equals("GET_ALL")) {
                                productosFiltrados.clear();
                            }

                            ApiResponse response = new ApiResponse(filterData, productosFiltrados);
                            String jsonResponse = gson.toJson(response);
                            pw.println(jsonResponse);
                            pw.flush();
                        }
                    }
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

    private static synchronized void handlePurchase(String jsonCart, Socket cl) throws IOException {
        PrintWriter pw = new PrintWriter(new OutputStreamWriter(cl.getOutputStream()));
        Map<String, Object> response = new HashMap<>();
        try {
            Type listType = new TypeToken<ArrayList<Producto>>(){}.getType();
            List<Producto> cartItems = gson.fromJson(jsonCart, listType);

            if (cartItems == null || cartItems.isEmpty()) {
                throw new Exception("El carrito está vacío.");
            }

            // Validar stock
            for (Producto item : cartItems) {
                Producto productInInventory = inventario.stream()
                    .filter(p -> p.id == item.id)
                    .findFirst()
                    .orElse(null);
                if (productInInventory == null || productInInventory.stock < item.quantity) {
                    throw new Exception("Stock insuficiente para " + (productInInventory != null ? productInInventory.nombre : "un producto desconocido"));
                }
            }

            // Actualizar inventario
            for (Producto item : cartItems) {
                for (Producto product : inventario) {
                    if (product.id == item.id) {
                        product.stock -= item.quantity;
                        break;
                    }
                }
            }
            actualizarInventarioCSV();

            response.put("success", true);
            response.put("message", "Compra realizada con éxito.");
            response.put("compra", cartItems);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
        } finally {
            pw.println(gson.toJson(response));
            pw.flush();
            if (cl != null && !cl.isClosed()) {
                cl.close();
            }
        }
    }

    private static void actualizarInventarioCSV() throws IOException {
        try (PrintWriter writer = new PrintWriter(new FileWriter("servidor/productos.csv"))) {
            writer.println("id,nombre,descripcion,precio,stock,imagen,categoria");
            for (Producto p : inventario) {
                writer.println(String.format("%d,%s,\"%s\",%f,%d,%s,%s",
                    p.id, p.nombre, p.descripcion, p.precio, p.stock, p.imagen, p.categoria));
            }
        }
    }
}