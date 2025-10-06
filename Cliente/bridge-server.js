import express from 'express';
import cors from 'cors';
import net from 'net';
import path from 'path';

const app = express();
const PORT = 3001; // Puerto para el servidor intermediario
const JAVA_SERVER_PORT = 8000;
const JAVA_SERVER_HOST = 'localhost';

app.use(cors());
app.use(express.json());

// Endpoint para obtener las imágenes
app.get('/img/:imageName', (req, res) => {
    const { imageName } = req.params;
    const client = new net.Socket();

    client.connect(JAVA_SERVER_PORT, JAVA_SERVER_HOST, () => {
        console.log(`Solicitando imagen: ${imageName}`);
        client.write(`GET_IMAGE:img/${imageName}\n`);
    });

    const extension = path.extname(imageName).toLowerCase();
    let contentType = 'image/jpeg'; // default
    if (extension === '.png') {
        contentType = 'image/png';
    } else if (extension === '.svg') {
        contentType = 'image/svg+xml';
    }
    res.setHeader('Content-Type', contentType);

    client.on('data', (data) => {
        res.write(data);
    });

    client.on('close', () => {
        res.end();
    });

    client.on('error', (err) => {
        console.error('Error de conexión con el servidor Java:', err.message);
        res.status(500).send('Error interno del servidor');
    });
});

// Endpoint principal para obtener los productos
app.get('/api/productos', (req, res) => {
    const client = new net.Socket();
    let jsonDataString = '';

    client.connect(JAVA_SERVER_PORT, JAVA_SERVER_HOST, () => {
        console.log('Puente conectado al servidor Java.');
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

            const translatedProducts = parsedData.products.map(p => ({
                id: p.id,
                name: p.nombre,
                image: p.rutaImagen.replace('img/', ''), // Solo quitar el prefijo 'img/'
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
