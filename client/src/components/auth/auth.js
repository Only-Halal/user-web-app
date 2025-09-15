import { useState } from 'react'
import { Modal, Button, Card } from 'react-bootstrap';
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import Signup from '../Signup/Signup';
import Login from '../login/login';



function Auth({ show, onClose}) {

    const [showSignup, setShowSignup] = useState(false);
    const showSignupComp = () => {
        setShowSignup(true);
        onClose()
    }

    const [showLogin, setShowLogin] = useState(false);
    const showLoginComp = () => {
        setShowLogin(true);
        onClose();

    }

    return (

        <Modal
            show={show}
            onHide={onClose}
            contentClassName="custom-login-content"
            dialogClassName="custom-login-dialog"
            closeButton
        >

            <Modal.Header closeButton>
            </Modal.Header>
            <Modal.Body >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', }}>
                    <div >
                        <h3 style={{ fontWeight: '900' }}>Welcome!</h3>
                    </div>

                    <div>
                        <p>Signup or login to continue</p>
                    </div>

                    <div style={{ backgroundColor: '#f8971d', width: '90%', marginTop: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3px', borderRadius: '5px', color: 'white' }}>
                        <FaFacebook />
                        <Button style={{ backgroundColor: '#f8971d', color: 'white', border: '#f8971d', hover: { backgroundColor: '#ffd7a7ff' } }}>
                            Login with facebook
                        </Button>
                    </div>

                    <div style={{ backgroundColor: '#e9e9e9ff', width: '90%', border: 'black 1px solid', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px', padding: '3px', borderRadius: '5px', color: 'white' }}>
                        <FcGoogle />
                        <Button style={{ backgroundColor: '#e9e9e9ff', color: 'black', border: '#d3d3d3ff', hover: { backgroundColor: '#ffd7a7ff' } }}>
                            continue with google
                        </Button>
                    </div>

                    <div style={{ backgroundColor: 'black', width: '90%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3px', marginTop: '10px', borderRadius: '5px', color: 'white' }}>
                        <FaApple />
                        <Button style={{ backgroundColor: 'black', color: 'white', border: 'black' }}>
                            continue with apple
                        </Button>
                    </div>

                    <div style={{ marginTop: '20px' }}><p>or</p></div>

                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ backgroundColor: '#f8971d', width: '90%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '3px', borderRadius: '5px', color: 'white' }}>
                            <Button
                                onClick={showLoginComp}
                                style={{ backgroundColor: '#f8971d', color: 'white', border: 'black' }}>
                                log in
                            </Button>
                        </div>

                        <div style={{ backgroundColor: 'white', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '10px', borderRadius: '5px', color: 'white' }}>
                            <Button
                                onClick={showSignupComp}

                                style={{ backgroundColor: 'white', width: '90%', color: 'black', border: 'black 1px solid', padding: '10px' }}>
                                Sign up
                            </Button>
                        </div>

                        <div style={{ marginTop: '20px', width: '90%', color: 'grey', fontSize: '12px', textAlign: 'flex-start' }}>
                            <p>By signing up, you agree to our <span style={{ color: '#f8971d' }}>Terms and Conditions <span>and</span> Privacy Policy</span>.</p>
                        </div>
                    </div>
                </div>
            </Modal.Body>

            {showSignup && <Signup show={showSignup} onClose={() => setShowSignup(false)} />}
            {showLogin && <Login show={showLogin} onClose={() => setShowLogin(false)} />}

        </Modal>
    )
}

export default Auth