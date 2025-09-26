// NOTA: opcionalmente se puede utilizar el hook useMemo para un mejor rendimiento en la pagina
import { useEffect, useMemo } from "react"

function Header({carro, romeFromCart, increaseQuantity, decreaseQuantity, emptyCar}) {
    // Dentro de la funcion, podemos agregar codigo HTML.

    //State derivado
    const initialValue = 0
    const isEmpty  = useMemo (() => carro.length === 0, [carro] ) // Reacciona solo si carro se actualiza, solo si la dependencia
    const cartTotal = useMemo(() => carro.reduce((total, item) => total + (item.quantity * item.price), initialValue), [carro])  // Nos permite ir sumando cada valor que tengamos sobre el array que estemos trabajando, en este caso el array es carro
    const Comprar = () => {
        console.log("Se compra")
    }

    return (
        // Lo que este dentro de este return, sera lo que se mostrara en pantalla
        
        <> {/* Creamos un fragmento */} 
            <header className="py-5 header">
                <div className="container-xl">
                    <div className="row justify-content-center justify-content-md-between">
                        <div className="col-8 col-md-3">
                            <a href="index.html">
                                <img className="img-fluid" src="/img/logo.svg" alt="imagen logo" />
                            </a>
                        </div>
                        <nav className="col-md-6 a mt-5 d-flex align-items-start justify-content-end">
                            <div 
                                className="carrito"
                            >
                                <img className="img-fluid" src="/img/carrito.png" alt="imagen carrito" />

                                <div id="carrito" className="bg-white p-4 rounded-lg shadow-lg min-w-[320px]">
                                    { isEmpty ? (
                                        <p className="text-center text-gray-500">El carrito está vacío</p>
                                    ) : (
                                        <>
                                            <table className="w-full text-center table-auto">
                                                <thead>
                                                    <tr className="bg-gray-100">
                                                        <th className="py-2">Nombre</th>
                                                        <th className="py-2">Precio</th>
                                                        <th className="py-2">Cantidad</th>
                                                        <th className="py-2"></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {carro.map(guitarra => (
                                                        <tr key={guitarra.id} className="border-b last:border-b-0">
                                                            <td className="py-2">{guitarra.name}</td>
                                                            <td className="py-2 font-semibold">${guitarra.price}</td>
                                                            <td className="py-2">
                                                                <div className="flex items-center justify-center gap-2">
                                                                    <button
                                                                        type="button"
                                                                        className="bg-gray-800 text-white px-2 py-1 rounded hover:bg-gray-700 transition"
                                                                        onClick={() => decreaseQuantity(guitarra.id)}
                                                                    >
                                                                        -
                                                                    </button>
                                                                    <span className="mx-2">{guitarra.quantity}</span>
                                                                    <button
                                                                        type="button"
                                                                        className="bg-gray-800 text-white px-2 py-1 rounded hover:bg-gray-700 transition"
                                                                        onClick={() => increaseQuantity(guitarra.id)}
                                                                    >
                                                                        +
                                                                    </button>
                                                                </div>
                                                            </td>
                                                            <td className="py-2">
                                                                <button
                                                                    className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition"
                                                                    type="button"
                                                                    onClick={() => romeFromCart(guitarra.id)}
                                                                >
                                                                    X
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            <p className="text-right mt-2 text-lg">
                                                Total a pagar: <span className="font-bold">${cartTotal}</span>
                                            </p>
                                            <button
                                                className="bg-gray-800 text-white w-full mt-3 py-2 rounded hover:bg-gray-700 transition font-semibold"
                                                onClick={Comprar}
                                            >
                                                Comprar
                                            </button>
                                            <button
                                                className="bg-red-100 text-red-700 w-full mt-3 py-2 rounded border border-red-300 hover:bg-red-200 transition font-semibold"
                                                onClick={emptyCar}
                                            >
                                                Vaciar Carrito
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </nav>
                    </div>
                </div>
            </header>            
        </>
    )
}

export default Header