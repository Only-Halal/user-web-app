// import React from 'react'
// import { Modal } from 'react-bootstrap';

// function CartSidebar({ show, onClose }) {

//     return (
//         <Modal
//             show={show}
//             onHide={onClose}
//             left
//             closeButton
//             data-bs-toggle="offcanvas"
//             data-bs-target="#sidebar"
//         >
//             <Modal.Header closeButton>
//                 <Modal.Title>Cart</Modal.Title>
//             </Modal.Header>
//             <Modal.Body>
//                 {/* Cart items will be displayed here */}
//                 <p>Your cart is empty.</p>
//             </Modal.Body>
//             <Modal.Footer>
//                 <button className="btn btn-primary" onClick={onClose}>
//                     Close
//                 </button>
//             </Modal.Footer>

//         </Modal>
//     )
// }

// export default CartSidebar

import React from 'react';
import { Offcanvas, Button, Card } from 'react-bootstrap';

function CartSidebar({ show, onClose }) {

    const [quantity, setQuantity] = React.useState(1);

    const cartItems = [
        {
            id: 1,
            name: 'Pizza Margherita',
            price: 2999,
            quantity: 2,
            image: "/images/burger.jpg",
        },
        {
            id: 2,
            name: 'Pizza Margherita',
            price: 1499,
            quantity: 1,
            inches: 12,
            image: "/images/burger.jpg",
        },
    ];

    const increase = () => setQuantity((prev) => prev + 1);
    const decrease = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

    return (
        <Offcanvas show={show} onHide={onClose} placement="end">
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>Your Items</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body className="d-flex flex-column p-0" style={{ height: '100%' }}>
                <div className="p-3" style={{ flex: 1, overflowY: 'auto' }}>
                    {cartItems.length === 0 ? (
                        <p className="text-muted">Your cart is empty.</p>
                    ) : (
                        cartItems.map((item) => (
                            <Card key={item.id} className="mb-3">
                                <Card.Body>
                                    <div>
                                        <div className="d-flex align-items-center">
                                            <img
                                                src='card-pizza.jpg'
                                                alt={item.name}
                                                style={{
                                                    width: '80px',
                                                    height: '80px',
                                                    objectFit: 'cover',
                                                    marginRight: '15px',
                                                    borderRadius: '8px',
                                                }}
                                            />
                                            <div className="flex-grow-1">
                                                <h6 className="mb-1">{item.name}</h6>
                                                <div className="text-muted mb-2">
                                                    <small>inches: 12</small>
                                                </div>
                                                <div className="mb-1">
                                                    <p>Rs {item.price}</p> 
                                                </div>
                                            </div>

                                            <div className="qty-btns d-flex align-items-center gap-2">
                                                <Button
                                                    variant="outline-secondary"
                                                    className="inc-btn"
                                                    size="sm"
                                                    onClick={decrease}
                                                >
                                                    –
                                                </Button>
                                                <span style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
                                                    {quantity}
                                                </span>
                                                <Button
                                                    variant="outline-secondary"
                                                    size="sm"
                                                    className="inc-btn"
                                                    onClick={increase}
                                                >
                                                    +
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>


                        ))
                    )}
                </div>

                {/* //total and price details */}
                <div className="p-3">

                    <div className='d-flex gap-10 justify-content-between align-items-center mr-100'>
                        <p>Subtotal</p>
                        <p>$20</p>
                    </div>

                    <div className='d-flex gap-10 justify-content-between align-items-center mr-100'>
                        <p>Tax & service fee</p>
                        <p>$5.05</p>
                    </div>

                    <div className='d-flex gap-10 justify-content-between align-items-center mr-100'>
                        <p>Delivery</p>
                        <p>$2.00</p>
                    </div>

                    <div className='d-flex gap-10 justify-content-between align-items-center mr-100'>
                        <p>Tip</p>
                        

                    </div>
                </div>

                <div className="p-3 mb-3 mt-3">
                    <div className='d-flex gap-10 justify-content-between align-items-center mr-100'>
                        <p>Total <span>(incl. fees and tax)</span></p>
                        <p>$29.90</p>
                    </div>
                    <Button variant="btn btn-warning w-100 " className="w-100">
                        Review paymnet and address
                    </Button>
                </div>
            </Offcanvas.Body>
        </Offcanvas>
    );
}

export default CartSidebar;
