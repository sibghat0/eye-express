import React, { Component } from "react";
import "./enquiry.css";

export default class Enquiry extends Component {
  render() {
    return (
      <div className="enquiry">
        <h3>Business Enquiry</h3>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Sed, odio
          dolore. Facilis temporibus accusamus culpa quidem repellat omnis ea.
          Quis voluptate ullam consequuntur! Minima voluptates deleniti sint
          iure! Ducimus et veniam aut. Iste, ad? Beatae odit quidem laborum.
          Quam iusto ex ipsa voluptatum voluptate architecto dolor doloremque
          eos voluptates officia rerum deleniti cum, tempora nesciunt quibusdam
          earum enim omnis, facilis illum temporibus suscipit aut! Inventore
          exercitationem dicta, quas debitis harum aut in, cupiditate illum
          culpa voluptatem maxime hic a dolorem recusandae temporibus amet rem
          sunt est! Fugit ipsa, quae commodi fugiat cum totam velit nihil in
          autem quibusdam non consectetur eligendi labore iusto? Voluptates
          facere nihil possimus nostrum praesentium. Necessitatibus, porro quas
          tempore molestias itaque cum repellat sed nesciunt tenetur.
        </p>
        <div className="contact-div">
          <span>
            <i className="fas fa-envelope"></i>
          </span>
          <a href="mailto:support@tridot.com">support@tridot.com</a>
          <h3>drop us a mail</h3>
        </div>
      </div>
    );
  }
}
