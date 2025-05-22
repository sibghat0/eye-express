import React, { Component } from "react";
import "./footer.css";
import Logo from "../../../assets/eye-express-logo.png";
export default class Footer extends Component {
  render() {
    return (
      <footer>
        <div className="footer-main">
          <div className="footer-container">
            <div className="footer-info logo-section">
              <img className="logo" src={Logo} alt="" />
              
            </div>
            <div className="footer-info">
              <h3>ContactUs</h3>
              <a href="#">2611 West Bengal</a>
              <a href="#">Near Kustia more</a>
              <a href="#">Kolkata 700046</a>
              <a href="#">XXX-XXX-5555</a>
            </div>
            <div className="footer-info">
              <h3>Services</h3>
              <a href="#">Shop</a>
              <a href="#">Wholsale</a>
              <a href="#">Retail</a>
              <a href="#">Our Products</a>
            </div>
            <div className="footer-info">
              <h3>Other</h3>
              <a href="/Terms">Terms & Condition</a>
              <a href="/Enquiry">Business Enquiry</a>
              <a href="/Form">Contact</a>
              <div className="media">
                <a href="#">
                  <i class="fab fa-facebook"></i>
                </a>
                <a href="#">
                  <i class="fab fa-instagram"></i>
                </a>
                <a href="#">
                  <i class="fab fa-whatsapp"></i>
                </a>
              </div>
            </div>
          </div>
          <div className="copy">
            <h3>©EYE EXPRESS OPTICAL 2023</h3>
            <h3>
              Powered by <span>Endevelopment</span>
            </h3>
          </div>
        </div>
      </footer>
    );
  }
}
