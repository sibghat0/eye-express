import React, { createRef } from "react";
import "./navbar.css";
import firebase from "firebase";
import Loader from "../../components/loader/loader";
import logo from "../../../assets/eye-express-logo.png";
// import logo_black from "../../../assets/logo black square.png";
import {
  Button,
  ClickAwayListener,
  Modal,
  Paper,
  TextField,
  Typography,
} from "@material-ui/core";
import { Link } from "react-router-dom";
import toaster from "toasted-notes";
import Cart from "../cart/cart";
import search from "../../../assets/search.png";
import search2 from "../../../assets/search2.png";

export default class Navbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hamburger: false,
      profileOptions: false,
      width: window.innerWidth,
      cart: false,
      user: {},
      inputActive: false,
      searchedProducts: [],
      searchValue: "",
      hub: [],
      loading: true,
    };
    this.input = createRef();
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        firebase
          .firestore()
          .collection("users")
          .where("email", "==", user.email)
          .get()
          .then((snap) => {
            snap.forEach((doc) => {
              this.setState({
                user: {
                  ...doc.data(),
                  id: doc.id,
                },
              });
              console.log(doc.data());
            });
            firebase
              .firestore()
              .collection("products")
              .get()
              .then((snap) => {
                var hub = [];
                snap.forEach((doc) => {
                  var product = doc.data();
                  product.id = doc.id;
                  hub.push(product);
                });
                this.setState({ hub, loading: false });
              });
          });
      } else {
        firebase
          .firestore()
          .collection("products")
          .get()
          .then((snap) => {
            var hub = [];
            snap.forEach((doc) => {
              var product = doc.data();
              product.id = doc.id;
              hub.push(product);
            });
            this.setState({ hub, loading: false });
          });
        this.setState({ loading: false });
      }
    });
  }

  handleLogout = () => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        window.location.reload();
      })
      .catch((err) => {
        alert("Please Reload Page to continue!!");
        console.log(err);
      });
  };

  toggleCart = () => {
    this.setState({
      cart: !this.state.cart,
    });
  };
  handleSearch = (e) => {
    console.log(e.target);
    var searchedProducts = [];
    this.setState(
      {
        searchValue: e.target.value,
      },
      () => {
        this.state.hub.forEach((product) => {
          if (
            product.title
              .toLowerCase()
              .includes(this.state.searchValue.toLowerCase()) ||
            product.category
              .toLowerCase()
              .includes(this.state.searchValue.toLowerCase()) ||
            product.subcategory
              .toLowerCase()
              .includes(this.state.searchValue.toLowerCase())
          ) {
            searchedProducts.push(product);
          }
        });
        this.setState({
          searchedProducts,
        });
      }
    );
  };
  render() {
    return (
      <>
        {this.state.loading ? (
          <Loader />
        ) : (
          <>
            <div className="navposition" id="navposition">
              <a href="/">
                <img
                  src={logo}
                  alt="logo"
                  id={this.state.inputActive ? "hide" : ""}
                />
              </a>

              <div className="navbar">
                {this.state.hamburger ? null : (
                  <ClickAwayListener
                    onClickAway={() => {
                      this.setState({
                        inputActive: false,
                        searchValue: "",
                        searchedProducts: [],
                      });
                    }}
                  >
                    <div
                      className={
                        this.state.inputActive ? "search open" : "search"
                      }
                    >
                      <input
                        type="text"
                        placeholder="What are You Looking For ?"
                        className={this.state.inputActive ? "open" : ""}
                        onChange={this.handleSearch}
                        value={this.state.searchValue}
                        ref={this.input}
                      />
                      {this.state.inputActive ? (
                        <img
                          src={search2}
                          alt=""
                          onClick={() => {
                            this.input.current.focus();
                            this.setState({
                              inputActive: !this.state.inputActive,
                              searchValue: "",
                              searchedProducts: [],
                            });
                          }}
                        />
                      ) : (
                        <img
                          src={search}
                          alt=""
                          onClick={() => {
                            this.input.current.focus();
                            this.setState({
                              inputActive: !this.state.inputActive,
                              searchValue: "",
                              searchedProducts: [],
                            });
                          }}
                        />
                      )}
                    </div>
                  </ClickAwayListener>
                )}

                <div className="home fil">
                  <a href="/">Home</a>
                </div>
                <div className="project fil">
                  <a href="/orders">Orders</a>
                </div>
                <div className="scope fil">
                  <a href="/products">Products</a>
                </div>
                <div
                  className="About Us fil"
                  onClick={() =>
                    this.state.user.id
                      ? this.setState({ cart: true })
                      : (window.location.href = "/login")
                  }
                >
                  <i class="fas fa-shopping-cart"></i>
                  <span>Cart</span>
                </div>
                <div
                  className="contacts fil"
                  onClick={() =>
                    this.state.user.id
                      ? this.setState({
                          profileOptions: !this.state.profileOptions,
                        })
                      : (window.location.href = "/login")
                  }
                >
                  <i class="fas fa-user"></i>
                  <span>{this.state.user.id ? "Profile" : "Login"}</span>
                  {this.state.profileOptions ? (
                    <ClickAwayListener
                      className="clickAway"
                      onClickAway={() =>
                        this.setState({ profileOptions: false })
                      }
                    >
                      {/* <div className="profile-options">
                        <Link
                          className="options"
                          to={{ pathname: "/profile" }}
                          onClick={() => this.setState({ profileOptions: false })}
                        > */}
                      <div className="profile-options">
                        <Link
                          className="options"
                          to={{ pathname: "/profile" }}
                          onClick={() =>
                            this.setState({ profileOptions: false })
                          }
                        >
                          <i className="fas fa-cog"></i>
                          <p>Profile settings</p>
                        </Link>

                        <div className="options" onClick={this.handleLogout}>
                          <i className="fas fa-sign-out-alt"></i>
                          <p>Logout</p>
                        </div>
                      </div>
                    </ClickAwayListener>
                  ) : null}
                </div>
                <div
                  className={
                    this.state.hamburger ? "hamburger active" : "hamburger"
                  }
                  id={this.state.inputActive ? "hide" : ""}
                  onClick={() =>
                    this.setState({ hamburger: !this.state.hamburger }, () => {
                      if (this.state.hamburger) {
                        document.body.style.overflowY = "hidden";
                      } else {
                        document.body.style.overflowY = "scroll";
                      }
                    })
                  }
                >
                  <div className="line1"></div>
                  <div className="line2"></div>
                  <div className="line3"></div>
                </div>
              </div>
              <div
                className={
                  this.state.hamburger
                    ? "hamburger-background active"
                    : "hamburger-background"
                }
                onClick={() =>
                  this.setState({
                    hamburger: false,
                  })
                }
              >
                <div
                  className={
                    this.state.hamburger ? "ham-links active" : "ham-links"
                  }
                  onClick={(e) => e.stopPropagation()}
                >
                  <img src={logo} alt="" className="hamburger-logo" />
                  <div className="links">
                    <div className="home fil">
                      <a href="/">
                        <i className="fas fa-home"></i>
                        Home
                      </a>
                    </div>
                    <div className="project fil">
                      <a href="/orders">
                        <i className="fas fa-clipboard-list"></i>
                        Orders
                      </a>
                    </div>
                    <div className="scope fil">
                      <a href="/products">
                        <i className="fas fa-box"></i>
                        Products
                      </a>
                    </div>
                    <div
                      className="About Us fil"
                      onClick={() =>
                        this.state.user.id
                          ? this.setState({ cart: true, hamburger: false })
                          : (window.location.href = "/login")
                      }
                    >
                      <span>
                        <i className="fas fa-shopping-cart"></i>
                        Cart
                      </span>
                    </div>
                    <div className="contacts fil">
                      <a href={this.state.user.id ? "/profile" : "/login"}>
                        <i className="fas fa-sign-in-alt"></i>
                        {this.state.user.id ? "Profile" : "Login"}
                      </a>
                    </div>
                  </div>
                  <div className="social-media">
                    <a href="https://www.facebook.com/Theorydev7/">
                      <i className="fab fa-facebook"></i>
                    </a>
                    <a href="https://www.instagram.com/theorydev?igshid=v0r6aik0140f">
                      <i class="fab fa-instagram"></i>
                    </a>
                    {/* <a href="https://www.linkedin.com/in/theory-dev-09a9201b7">
                    <i class="fab fa-linkedin-in"></i>
                  </a> */}
                    <a href="https://www.twitter.com/theory_dev">
                      <i class="fab fa-twitter"></i>
                    </a>
                    {/* <a href="#">
                    <i class="fab fa-pinterest-square"></i>
                  </a> */}
                  </div>
                </div>
              </div>
            </div>
            <Cart
              active={this.state.cart}
              onClose={() => this.setState({ cart: false })}
              cartUpdate={this.props.cartUpdate}
            />
            {this.state.inputActive && this.state.searchValue.length > 0 && (
              <Paper className="paper" elevation={5}>
                <h3>Searched Products</h3>
                <div className="search">
                  {this.state.searchedProducts.length > 0 ? (
                    this.state.searchedProducts.map((item) => {
                      return (
                        <a
                          href={`/products/${item.id}`}
                          className="search-item"
                        >
                          <img src={item.images[0].image} alt="" />
                          <div className="data">
                            <div className="left">
                              <h5>{item.title}</h5>
                              <div className="price">
                                <p>&#8377;{item.variations[0].listing}</p>
                                <p>&#8377;{item.variations[0].usual}</p>
                                <p className="price">{`${parseInt(
                                  100 -
                                    (item.variations[0].listing /
                                      item.variations[0].usual) *
                                      100
                                )}%`}</p>
                              </div>
                            </div>
                          </div>
                        </a>
                      );
                    })
                  ) : (
                    <h4
                      style={{
                        fontWeight: 500,
                        textAlign: "center",
                        marginBottom: 10,
                      }}
                    >
                      No results found
                    </h4>
                  )}
                </div>
              </Paper>
            )}
          </>
        )}
      </>
    );
  }
}
