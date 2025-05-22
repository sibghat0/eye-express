import React, { Component } from "react";
import "./about.css";
import about from "../../../../assets/about.jpg";

export default class About extends Component {
  render() {
    return (
      <div className="AboutUs">
        <div className="line"></div>
        <h1>About Us</h1>
        <div className="about-p">
          <div className="secondsec-imgcontainer">
            <img src={about} alt="about image" />
          </div>
          <p>
            <b>EYE-EXPRESS ,</b> is a website that allows you to buy and sell
            tangible goods, digital products or services online. Trade, be it
            barter exchange or buying and selling of goods and services has been
            prevalent for centuries. No one can be self-sufficient. And this
            brings out the need for demand and supply of goods and services.
            Transactions have been going on all over the world for centuries,
            locally, and across locations. Keeping the same concept in mind, now
            think electronic.
          </p>
        </div>
      </div>
    );
  }
}
