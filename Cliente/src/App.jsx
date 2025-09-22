import { useState, useEffect } from 'react'
import Header from './components/Header' //Importamos el componente para poder utilizarlo
import { Guitarras } from './components/Guitarras'
import { db } from './data/db'

function App() {

    // // State
    // const [auth, setAuth] = useState(false)
    // // Effect
    // useEffect (() => {
    //     console.log('Effect listo')
    // }, []) // Si en la parte de dependencias agregamos un arreglo vacio, indicamos que no tiene dependencias, por tanto se ejecuta en cuanto arraque la pagina

    // useEffect (() => {
    //     console.log('autenticado')
    // }, [auth]) //Si dentro de las corchetes tiene una variable, este se ejecutara cuando menos una vez reciba el valor de auth, depende de la variable para ejecutarse

    //Carrito inicial
    const initialCart = () => {
        const localStorageCart = localStorage.getItem('carro')
        return localStorageCart ? JSON.parse(localStorageCart) : [] // Si tiene algun string el carro, lo com=nvertimos a arreglo para poder mostrarlo en el carro, de lo contrario setea el carro con un arreglo vacio para poder agregar elementos
    }

    //Preparamos la bd para usarla
    const [data, setData] = useState([])

    const MAX_ITEMS = 5
    const MIN_ITEMS = 1

    useEffect (() => {
        setData(db)
    },[]) //Si esta listo, actua y le da la base de datos a data

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
        setCarro([]) // Vaciamos el carrito
    }

  return (
      <>
      {/* Aqui renderizamos el componente dentro de este componente */}
      
        {/* 
            Debido a que JSX tiene palabras reservadas, como lo es class, no podemos utilizar esa palabra dentro del codigo HTML, por lo que tenemos que utilizar las palabras a resevadas de React. En esta caso para darle una calse a un elemento HTML en React, se utiliza className para evitar utilizar la palabra reservada class 
            
            Correcto: <header className="py-5 header">
            Incorrecto <header class="py-5 header">
        
        */}
        
        <Header
            carro = {carro}
            romeFromCart = {romeFromCart}
            increaseQuantity = {increaseQuantity}
            decreaseQuantity = {decreaseQuantity}
            emptyCar = {emptyCar}
        />

        <main className="container-xl mt-5">
            <h2 className="text-center">Nuestra Colección</h2>

            <div className="row mt-5">
                {/* Iterando sobre el arreglo de data */}
                {data.map((guitarra) => ( // Por cada guitarra que haya en el array
                    <Guitarras
                        //Creamos un prop PADRE
                        key={guitarra.id} //Creamos el ID que necesita cuando iteramos
                        guitarra = {guitarra} //Creamos una propiedad guitarra (este nombre debe recibir como argumento el prop hijo) y el valor de esa propiedad es el objeto llamdo guitarra (argumento del arrow funciton)
                        addToCart = {addToCart} //Le pasamos esta funcion como propiedad al componente
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
