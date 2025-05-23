import React from "react";

function Footer() {
  return (
    <div className="main-footer">
      <div className=" container call-container d-flex justify-content-center mb-5">
        <div className="call-img">
          <img src="call-img" />
        </div>
        <div
          className="call-text d-flex flex-column justify-content-center text-center"
          style={{ height: "160px" }}
        >
          <p> Call us to make order now </p>
          <h1> 90-500-28- 999</h1>
        </div>
      </div>

      <div className=" container footer-logo mb-5 ">
        <img src="logozomoto.png" />
      </div>
      <div className="last-par d-flex justify-content-center">
        <p style={{ color: "white" }}>
          Etiam consequat sem ullamcorper, euismod metus sit amet, tristique
          <br />
          justo. Vestibulum mattis, nisi ut faucibus commodo, risus ex commodo.
        </p>
      </div>
    </div>
  );
}

export default Footer;
