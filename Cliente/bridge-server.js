import express from 'express';
import cors from 'cors';
import net from 'net';

const app = express();
const PORT = 3001; // Puerto para el servidor intermediario
const JAVA_SERVER_PORT = 8000;
const JAVA_SERVER_HOST = 'localhost';

app.use(cors());
app.use(express.json());

// Endpoint principal para obtener los productos
app.get('/api/productos', (req, res) => {
    const client = new net.Socket();
    let jsonDataString = '';

    client.connect(JAVA_SERVER_PORT, JAVA_SERVER_HOST, () => {
        console.log('Puente conectado al servidor Java.');
        // Determinar el comando a enviar basado en los query params
        const categoria = req.query.categoria;
        const command = categoria ? `GET_CATEGORY:${categoria}` : 'GET_ALL';
        console.log(`Enviando comando a Java: ${command}`);
        client.write(`${command}\n`);
    });

    client.on('data', (data) => {
        jsonDataString += data.toString();
    });

    client.on('close', () => {
        console.log('Conexión con el servidor Java cerrada.');
        try {
            const parsedData = JSON.parse(jsonDataString);

            // Traduccion de campos para que coincidan con el frontend de React
            const translatedProducts = parsedData.products.map(p => ({
                id: p.id,
                name: p.nombre, // Traducir 'nombre' a 'name'
                image: p.rutaImagen.replace('images/', '').replace('.jpg', ''), // Traducir y limpiar 'rutaImagen' a 'image'
                description: p.descripcion,
                price: p.precio,
                stock: p.stock,
                categoria: p.categoria
            }));

            const finalResponse = {
                filters: parsedData.filters,
                products: translatedProducts
            };

            res.json(finalResponse);
        } catch (error) {
            console.error('Error al parsear JSON del servidor Java:', error);
            res.status(500).json({ error: 'No se pudieron procesar los datos del servidor principal.' });
        }
    });

    client.on('error', (err) => {
        console.error('Error de conexión con el servidor Java:', err.message);
        res.status(500).json({ error: 'No se pudo conectar con el servidor principal.' });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor intermediario (puente) escuchando en http://localhost:${PORT}`);
});
