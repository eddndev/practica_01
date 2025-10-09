import React from 'react';

const TicketModal = ({ ticket, onClose }) => {
    if (!ticket) {
        return null;
    }

    const { compra, message } = ticket;
    const subtotal = compra.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const total = subtotal; // Assuming no taxes or other fees for now

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
                <h2 className="text-2xl font-bold mb-4 text-center">Resumen de Compra</h2>
                <p className="text-center mb-4">{message}</p>
                <div className="border-t border-b py-4">
                    {compra.map(item => (
                        <div key={item.id} className="flex justify-between items-center mb-2">
                            <div>
                                <p className="font-semibold">{item.name}</p>
                                <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                            </div>
                            <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                    ))}
                </div>
                <div className="mt-4">
                    <div className="flex justify-between">
                        <p className="text-lg">Subtotal:</p>
                        <p className="text-lg font-semibold">${subtotal.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between font-bold text-xl mt-2">
                        <p>Total:</p>
                        <p>${total.toFixed(2)}</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="mt-6 w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors"
                >
                    Cerrar
                </button>
            </div>
        </div>
    );
};

export default TicketModal;