import React from "react";
import manager from "../../../../assets/manager.png";
import home from "../../../../assets/home.png";
import skyline from "../../../../assets/skyline.png";
import "./ourService.css";
function ourService() {
  return (
    <div className="ourService">
      <h1>OUR SERVICES</h1>
      <div className="line"></div>
      <div className="services">
        <div>
          <img src={manager} alt="" />
          <p>nature of business</p>
          <p>manufacturer and supplier</p>
        </div>
        <div>
          <img src={skyline} alt="" />
          <p>year of establishment</p>
          <p>2006</p>
        </div>
        <div>
          <img src={home} alt="" />
          <p>market coveres</p>
          <p>domestic</p>
        </div>
      </div>
    </div>
  );
}

export default ourService;
