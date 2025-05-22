import React, { Component, createRef } from "react";
import "./App.css";
import { Switch, Route } from "react-router-dom";
import Homepage from "../src/layout/pages/homepage/homepage";
import Category from "./layout/pages/categoryPage/categoryPage";
import ProductDescription from "./layout/pages/productDescription/productDescription";
import Checkout from "./layout/pages/checkout/checkout";
import Login from "./layout/pages/login/login";
import Order from "./layout/pages/order/order";
import Profile from "./layout/pages/profilePage/profilePage";
import Navbar from "./layout/components/navbar/navbar";
import Footer from "./layout/components/footer/footer";
import firebase from "firebase";
import { withRouter } from "react-router-dom";
import OrderDetail from "./layout/pages/orderDetail/orderDetail";
import { NotFound } from "http-errors";
import Terms from "./layout/components/terms/terms";
import Form from "./layout/components/form/form";
import Enquiry from "./layout/components/enquiry/enquiry";
class App extends Component {
  constructor(props) {
    super(props);
    this.child = createRef();
    this.child2 = createRef();
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
     
      if (user && user.email === "test@test.com") {
        firebase
          .auth()
          .signOut()
          .catch((err) => console.log(err));
      }
    });
  }

  render() {
    console.log(this.props);
    return (
      <div className="App">
        <Navbar
          ref={this.child}
          cartUpdate={() =>
            this.props.location.pathname.includes("/products/")
              ? this.child2.current.cartUpdate()
              : null
          }
        />
        <Switch>
          <Route exact path="/" component={Homepage} />
          <Route exact path="/products" component={Category} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/orders" component={Order} />
          <Route exact path="/profile" component={Profile} />

          <Route exact path="/orders/:id" component={OrderDetail} />
          <Route exact path="/checkout" component={Checkout} />
          <Route exact path="/terms" component={Terms} />
          <Route exact path="/form" component={Form} />
          <Route exact path="/enquiry" component={Enquiry} />
          <Route
            exact
            path="/products/:id"
            render={(props) => (
              <ProductDescription
                {...props}
                ref={this.child2}
                toggleCart={() => this.child.current.toggleCart()}
              />
            )}
          />
          <Route path="*" component={NotFound} />
        </Switch>
        <Footer />
      </div>
    );
  }
}

export default withRouter(App);
