import React, { Component } from "react";
import "./lense.css";
import lense1 from "../../../../assets/lense1.webp";
import lense2 from "../../../../assets/lense2.webp";

export default class Lense extends Component {
  render() {
    return (
      <div className="Lens">
        <h4>CONTACT LENSES & MORE</h4>
        <div className="line"></div>
        <div className="imgContainer">
          <a href="#">
            <img src={lense1} alt="lense1" />
          </a>
          <a href="#">
            <img src={lense2} alt="lense2" />
          </a>
        </div>
      </div>
    );
  }
}
