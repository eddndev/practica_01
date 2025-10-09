import { useState, useEffect } from 'react'
import Header from './components/Header'
import { Guitarras } from './components/Guitarras'
import TicketModal from './components/TicketModal'

function App() {

    const initialCart = () => {
        const localStorageCart = localStorage.getItem('carro')
        return localStorageCart ? JSON.parse(localStorageCart) : []
    }

    const [data, setData] = useState([])
    const [ticket, setTicket] = useState(null)
    const [categorias, setCategorias] = useState(['Todas'])

    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todas')

    // Filtrar guitarras según la categoría seleccionada
    const guitarrasFiltradas = categoriaSeleccionada === 'Todas'
        ? data
        : data.filter(guitarra => guitarra.categoria.toLowerCase() === categoriaSeleccionada.toLowerCase())

    const MAX_ITEMS = 5
    const MIN_ITEMS = 1

    useEffect(() => {
        const fetchData = async () => {
            try {
                const url = 'http://localhost:3001/api/productos';
                const respuesta = await fetch(url);
                const resultado = await respuesta.json();
                
                // Sincronizar el estado con los datos del backend
                setData(resultado.products);
                setCategorias(['Todas', ...resultado.filters.categories]);

            } catch (error) {
                console.log(error)
            }
        }
        fetchData();
    }, [])

    // State para el carrito
    const [carro, setCarro] = useState(initialCart) // El carro inicialmente estara vacio

    useEffect(() => {
        /* 
            El Siguiente codigo es realizado para tener un carrito persistente usando localStorage
            Recibe dos parametros, el primero es un string que sera un identificador, keyname
            el segundo parametro es el valor, solo almacena strings localstorage, el arreglo de carro lo comvertimos a string
        */
       localStorage.setItem('carro', JSON.stringify(carro)) 
       console.log(typeof JSON.stringify(carro))
    }, [carro]) // Cada vez que el carro cambie, realizara el codigo que tiene dentro de la funcion

    function addToCart(item) { //recibimos un item

        const itemExist = carro.findIndex(elemento => elemento.id === item.id) //Si el id del elemeto que se encuentra en nuestro carrito es igual al elemento que se va agregar, retorna numero diferente de -1

        // Condicion para evitar duplicados y solo modificar la cantidad
        if (itemExist >= 0) { //Existe ya el item dentro del carrito
            if (carro[itemExist].quantity >= MAX_ITEMS) 
            return
            //Si ya existe el elemento, lo que queremos hacer es solo aumentar la cantidad de elementos del item
            const updateCar = [...carro] //hacemos copia del array original
            updateCar[itemExist].quantity++ //Accedemos a la posicion del item y aumentamos la cantidad
            setCarro(updateCar) //seteamos las nuevas actualizaciones
            
        }else{
            // No existe, se agrega el item completo al carrito
            item.quantity = 1 //Le agregamos la propiedad de cantidad al objeto, en este caso a la guitarra que sea agregada 
            setCarro([...carro, item]) //actualizamos el carro haciendo una copia del carro previo con el nuevo item que se vaya añadiendo al carro
        }

    }

    function romeFromCart(id) {
        /*
            El método filter() crea un nuevo array con todos los elementos que cumplan la condición implementada por la función dada.
        */
        setCarro(prevCart => prevCart.filter((guitarra) => guitarra.id !== id)) // Como estamos seteando, podemos tener acceso al carro previo, sobre el cual podemos trabajar. Accedemos a cada guitarra de forma individual, que filtrara las guitarras cuyo id sea distinto del id que se te esta dando.

    }

    function increaseQuantity(id){
        const updateCar = carro.map(
            item => {
            if (item.id === id && item.quantity < MAX_ITEMS) { // Si el id es el mismo que le estamos dando
                return {
                    ...item,
                    quantity: item.quantity + 1
                }
            }
            return item
        })
        setCarro(updateCar)
    }

    function decreaseQuantity(id){
        const updateCar = carro.map(
            item => {
                if (item.id == id && item.quantity > MIN_ITEMS) {
                    return {
                        ...item,
                        quantity: item.quantity - 1
                    }
                }
                return item
            }
        )
        setCarro(updateCar)
    }

    function emptyCar(){
        setCarro([])
    }

    async function handlePurchase() {
        try {
            const url = 'http://localhost:3001/api/purchase';
            const respuesta = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(carro)
            });
            const resultado = await respuesta.json();

            if (resultado.success) {
                setTicket(resultado);
                setCarro([]);
            } else {
                alert(`Error en la compra: ${resultado.message}`);
            }
        } catch (error) {
            console.log(error);
            alert('Error al conectar con el servidor para realizar la compra.');
        }
    }

    function closeTicketModal() {
        setTicket(null);
        const fetchData = async () => {
            try {
                const url = 'http://localhost:3001/api/productos';
                const respuesta = await fetch(url);
                const resultado = await respuesta.json();
                setData(resultado.products);
            } catch (error) {
                console.log(error)
            }
        }
        fetchData();
    }

  return (
      <>
        <Header
            carro = {carro}
            romeFromCart = {romeFromCart}
            increaseQuantity = {increaseQuantity}
            decreaseQuantity = {decreaseQuantity}
            emptyCar = {emptyCar}
            handlePurchase={handlePurchase}
        />

        <TicketModal
            ticket={ticket}
            onClose={closeTicketModal}
        />

        <main className="container-xl mt-5">

            <h2 className="text-center px-5">Nuestra Colección</h2>
            <div className="flex gap-4 justify-center my-4">
                    {categorias.map(cat => (
                        <button
                            key={cat}
                            className={`px-4 py-2 rounded ${categoriaSeleccionada === cat ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                            onClick={() => setCategoriaSeleccionada(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="row mt-5">
                    {guitarrasFiltradas.map((guitarra) => (
                        <Guitarras
                            key={guitarra.id}
                            guitarra={guitarra}
                            addToCart={addToCart}
                        />
                    ))}
                </div>
        </main>


        <footer className="bg-dark mt-5 py-5">
            <div className="container-xl">
                <p className="text-white text-center fs-4 mt-4 m-md-0">GuitarLA - Todos los derechos Reservados</p>
            </div>
        </footer>
      </>
  )
}

export default App
