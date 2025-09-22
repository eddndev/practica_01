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
                
                // Manejar cada cliente en un hilo separado para no bloquear el servidor
                new Thread(() -> handleClient(cl)).start();
            }
        }catch(Exception e){
            e.printStackTrace();
        }
    }

    private static void handleClient(Socket cl) {
        try (PrintWriter pw = new PrintWriter(new OutputStreamWriter(cl.getOutputStream()));
             BufferedReader br = new BufferedReader(new InputStreamReader(cl.getInputStream()))) {

            String command = br.readLine();
            System.out.println("Comando recibido: " + command);

            if (command == null) return;

            if (command.startsWith("GET_CATEGORY:")) {
                String categoria = command.substring(13);
                String response = inventario.stream()
                                            .filter(p -> p.categoria.equalsIgnoreCase(categoria))
                                            .map(Producto::toString)
                                            .collect(Collectors.joining("\n"));
                pw.println(response);
            } else if (command.equals("GET_ALL")) {
                String response = inventario.stream()
                                            .map(Producto::toString)
                                            .collect(Collectors.joining("\n"));
                pw.println(response);
            } else {
                pw.println("ERROR: Comando no reconocido.");
            }
            pw.flush();

        } catch (Exception e) {
            System.err.println("Error manejando al cliente: " + e.getMessage());
        } finally {
            try {
                cl.close();
            } catch (Exception e) {
                // Ignorar
            }
        }
    }

    private static void cargarProductos() {
        try (Scanner scanner = new Scanner(new File("servidor/productos.csv"))) {
            if (scanner.hasNextLine()) {
                scanner.nextLine(); // Omitir la línea de encabezado
            }
            while (scanner.hasNextLine()) {
                String linea = scanner.nextLine();
                
                // Parsing manual para 7 campos
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
