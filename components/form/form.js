import { Button, TextField } from "@material-ui/core";
import React, { useState } from "react";
import "./form.css";

function Form() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");

  return (
    <div className="support">
      <div className="left">
        <h3>For Help & support, enquiry, suggestion :-</h3>
        <p>Feel free to drop your comments</p>
        <div className="inputs">
          <TextField
            variant="outlined"
            label="Your Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="split">
            <TextField
              variant="outlined"
              label="Mobile"
              className="marginRight"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              fullWidth
            />
            <TextField
              variant="outlined"
              label="Email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <TextField
            variant="outlined"
            label="Comments"
            multiline
            className="textArea"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            fullWidth
          />
        </div>

        <Button variant="contained">Send</Button>
      </div>
      <div className="right">
        <h3>Get in touch with us...</h3>
        <div className="contacts-container">
          <div className="contact-div">
            <span>
              <i className="fas fa-phone-alt"></i>
            </span>
            <a href="tel:1234567890">XXXXX-54216</a>
            <h3>customer support</h3>
          </div>
          <div className="line"></div>
          <div className="contact-div">
            <span>
              <i className="fas fa-envelope"></i>
            </span>
            <a href="mailto:support@tridot.com">support@ecommerce.com</a>
            <h3>drop us a mail</h3>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Form;
