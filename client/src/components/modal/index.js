// FoodModal.js
import React from "react";
import { Modal, Button } from "react-bootstrap";
import { Dropdown } from "react-bootstrap";
import { useState } from "react";

function FoodModal({ show, onClose, food }) {
  const [quantity, setQuantity] = useState(1);

  const increase = () => setQuantity((prev) => prev + 1);
  const decrease = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      contentClassName="custom-modal-content"
      dialogClassName="custom-modal-dialog"
      closeButton
      scrollable
    >
      <Modal.Header closeButton>
        <Modal.Title>Soap</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="img-container">
          <img src="card-soap.jpeg" className="modal-image-top" closeButton />
        </div>
        <p
          className="my-2"
          style={{
            color: "red",
            fontWeight: "bold",
            fontSize: "1.5rem",
            fontFamily: "PPAgrandir",
          }}
        >
          <strong>Price:</strong> Rs. 323 Rs. 380 15% off
        </p>
        <p>Crispy chicken burger, fries & NR 345 ml Pepsi drin</p>
        <div className="drink-section d-flex justify-content-between bg-light p-3 rounded my-2">
          <h6>Choose Your Drink</h6>
          <h6>Choose Your Drink</h6>
        </div>
        <div className="special-instructions mb-3">
          <label
            htmlFor="specialInstructions"
            className="form-label"
            style={{ fontWeight: "bold", fontSize: "1.2rem" }}
          >
            Special instructions
          </label>
          <p className="text-muted">
            Special requests are subject to the restaurant's approval. Tell us
            here!
          </p>
          <textarea
            className="form-control"
            id="specialInstructions"
            rows="3"
            placeholder="Add any instructions here..."
          ></textarea>
        </div>

        {/* new div for textarea */}

        <div className="special-instructions mb-3">
          <label
            htmlFor="specialInstructions"
            className="form-label"
            style={{ fontWeight: "bold", fontSize: "1.2rem" }}
          >
            If this item is not available
          </label>

          <Dropdown drop="down">
            <Dropdown.Toggle
              variant="warning"
              id="dropdown-basic"
              style={{
                width: "100%",
                backgroundColor: "white",
                outline: "black",
                border: "1px solid lightgray",
                color: "black",
              }}
            >
              Remove it from my order
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item href="#/action-2">Cancel this order</Dropdown.Item>
              <Dropdown.Item href="#/action-3">Call me </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-between align-items-center w-100">
        {/* quantity button  */}
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
        <div className="d-flex gap-2">
          <Button variant="warning" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary">Add to Cart</Button>
        </div>

        {/* Right side: Quantity buttons */}
      </Modal.Footer>
    </Modal>
  );
}

export default FoodModal;
