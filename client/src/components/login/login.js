import { useState } from 'react'
import { Modal, Button, Card } from 'react-bootstrap';
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";



function Login({ show, onClose }) {

    return (

        <Modal
            show={show}
            onHide={onClose}
            contentClassName="custom-login-content"
            dialogClassName="custom-login-dialog"
            left
            closeButton
            scrollable
        >

            <Modal.Header closeButton>
                <Modal.Title>Login</Modal.Title>
            </Modal.Header>
            <Modal.Body >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', }}>
                    <div>
                        <h3 style={{ fontWeight: '900' }}>Welcome!</h3>
                    </div>

                    <div>
                        <p>Please log in to continue</p>
                    </div>

                    <div style={{ width: '90%', marginTop: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3px', borderRadius: '5px', color: 'white' }}>
                        <input type='text' placeholder='Enter Email' style={{ color: 'white', border: '#f8971d 1px solid', outline: 'none', padding: '5px', borderRadius: '10px', width: '100%' }} />
                    </div>
                    <div style={{ width: '90%', marginTop: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3px', borderRadius: '5px', color: 'white' }}>
                        <input type='text' placeholder='Enter password' style={{ color: 'white', border: '#f8971d 1px solid', outline: 'none', padding: '5px', borderRadius: '10px', width: '100%' }} />
                    </div>

                    <div style={{ marginTop: '10px', padding: '3px', borderRadius: '5px', color: 'white' }}>
                        <Button
                            style={{ color: 'black', backgroundColor: 'white', border: 'none', }}>
                            forgot password
                        </Button>
                    </div>

                    <div style={{ backgroundColor: "#f8971d", width: '90%', marginTop: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3px', borderRadius: '5px', color: 'white' }}>
                        <Button
                            style={{ backgroundColor: "#f8971d", color: 'white', border: 'none', }}>
                            log in
                        </Button>
                    </div>
                </div>

            </Modal.Body>


        </Modal>
    )
}

export default Login