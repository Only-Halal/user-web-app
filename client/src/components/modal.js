import React, { useState } from "react";
import { Modal, Button, Dropdown } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function FoodModal({ show, onClose, food }) {
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  const increase = () => setQuantity((prev) => prev + 1);
  const decrease = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleViewCart = () => {
    navigate("/view-cart");
  };

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      scrollable
      size="md"
      contentClassName="p-3"
      dialogClassName="custom-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>{food?.name || "Item"}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Image */}
        <div className="text-center mb-3">
          <img
            src={food?.image || "/placeholder.jpg"}
            alt={food?.name}
            className="img-fluid rounded"
            style={{ maxHeight: "100px", objectFit: "cover" }}
          />
        </div>

        {/* Description */}
        <p className="text-muted">{food?.description}</p>

        {/* Price */}
        <p className="fw-bold text-danger fs-5">
          Price: {food?.price || "Rs. ---"}
        </p>

        {/* Drink Option */}
        <div className="bg-light p-3 rounded mb-3">
          <h6 className="mb-2">Choose Your Drink</h6>
          <Dropdown>
            <Dropdown.Toggle
              variant="outline-dark"
              className="w-100 text-start"
            >
              Select a drink
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item>Pepsi</Dropdown.Item>
              <Dropdown.Item>7Up</Dropdown.Item>
              <Dropdown.Item>No Drink</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>

        {/* Special Instructions */}
        <div className="mb-3">
          <label htmlFor="specialInstructions" className="form-label fw-bold">
            Special instructions
          </label>
          <textarea
            className="form-control"
            rows="3"
            placeholder="E.g. No onions, extra spicy, etc."
          ></textarea>
        </div>

        {/* Item not available dropdown */}
        <div className="mb-3">
          <label className="form-label fw-bold">
            If this item is not available
          </label>
          <Dropdown>
            <Dropdown.Toggle
              variant="outline-secondary"
              className="w-100 text-start"
            >
              Remove it from my order
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item>Cancel this item</Dropdown.Item>
              <Dropdown.Item>Call me</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </Modal.Body>

      <Modal.Footer className="d-flex justify-content-between">
        {/* Quantity controls */}
        <div className="d-flex align-items-center">
          <Button variant="outline-secondary" onClick={decrease}>
            –
          </Button>
          <span className="mx-3 fw-bold fs-5">{quantity}</span>
          <Button variant="outline-secondary" onClick={increase}>
            +
          </Button>
        </div>

        {/* Action buttons */}
        <div className="d-flex gap-2">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleViewCart}>
            Add to Cart
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}

export default FoodModal;
