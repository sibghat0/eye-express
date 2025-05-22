import React, { Component } from "react";
import "./login.css";
import close from "../../../assets/close-grey.svg";
import {
  Button,
  Modal,
  TextField,
  Backdrop,
  CircularProgress,
} from "@material-ui/core";
import firebase from "firebase";
import toaster from "toasted-notes";
export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sign: true,
      login: true,
      reset: false,
      email: "",
      number: null,
      password: "",
      login_email: "",
      login_password: "",
      name: "",
      resetDone: false,
      error: {
        input: "",
        msg: "",
      },
      authenticating: false,
    };
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      if (
        !this.state.authenticating &&
        user &&
        user.email !== "test@test.com"
      ) {
        window.history.back();
      }
    });
    // document.body.classList.add("overflowNot");
  }

  componentWillUnmount() {
    // document.body.classList.remove("overflowNot");
  }

  handleChange = (e) => {
    if (e.target.name === this.state.error.input) {
      var error = {
        input: "",
        msg: "",
      };
      this.setState({
        error,
      });
    }
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  handleRegister = () => {
    this.setState({
      authenticating: true,
    });
    if (
      this.state.email.length > 0 &&
      this.state.email.includes("@") &&
      this.state.name.length > 0 &&
      this.state.number &&
      this.state.number.toString().length >= 10 &&
      this.state.password.length > 0
    ) {
      firebase
        .firestore()
        .collection("users")
        .where("email", "==", this.state.email)
        .get()
        .then((snap) => {
          if (snap.size === 0) {
            firebase
              .auth()
              .createUserWithEmailAndPassword(
                this.state.email,
                this.state.password
              )
              .then((user) => {
                firebase
                  .firestore()
                  .collection("users")
                  .add({
                    name: this.state.name,
                    email: this.state.email,
                    number: this.state.number,
                    addresses: [],
                    orders: [],
                    cart: [],
                    dob: null,
                    wishlist: [],
                    date: new Date(),
                  })
                  .then(() => {
                    this.setState({
                      email: "",
                      name: "",
                      password: "",
                      number: "",
                      authenticating: false,
                    });
                    window.history.back();
                  })
                  .catch((err) => {
                    toaster.notify("Something went wrong!");
                    console.log(err);
                    this.setState({ authenticating: false });
                  });
              })
              .catch((err) => {
                toaster.notify(err.message);
                console.log(err);
                this.setState({ authenticating: false });
              });
          } else {
            toaster.notify("User Already Exists!");
            this.setState({
              authenticating: false,
            });
          }
        })
        .catch((err) => {
          toaster.notify("Something went wrong!");
          console.log(err);
          this.setState({ authenticating: false });
        });
    } else {
      var error = {};
      if (this.state.name.length === 0) {
        error = {
          input: "name",
          msg: "Please your Name!",
        };
        this.setState({
          error,
        });
      } else if (this.state.email.length === 0) {
        error = {
          input: "email",
          msg: "Please enter Email!",
        };
        this.setState({
          error,
        });
      } else if (!this.state.email.includes("@")) {
        error = {
          input: "email",
          msg: "Please enter correct Email!",
        };
        this.setState({
          error,
        });
      } else if (
        this.state.number === "" ||
        this.state.number === 0 ||
        this.state.number.toString().length !== 10
      ) {
        error = {
          input: "number",
          msg: "Please enter phone number!",
        };
        this.setState({
          error,
        });
      } else {
        console.log(this.state.password.length);
        error = {
          input: "password",
          msg: "Please enter password!",
        };
        this.setState({
          error,
        });
      }
      this.setState({
        authenticating: false,
      });
    }
  };

  handleGoogleLogin = () => {
    var provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({
      login_hint: "user@example.com",
    });
    firebase
      .auth()
      .signInWithPopup(provider)
      .then((result) => {
        var token = result.credential;
        console.log(token);
        var user = result.user;
        console.log(user.email);
        this.setState({
          authenticating: true,
        });
        firebase
          .firestore()
          .collection("users")
          .where("email", "==", user.email)
          .get()
          .then((snap) => {
            if (snap.size === 0) {
              firebase
                .firestore()
                .collection("users")
                .add({
                  name: user.displayName,
                  email: user.email,
                  number: "",
                  addresses: [],
                  orders: [],
                  cart: [],
                  dob: [],
                  wishlist: [],
                  date: new Date(),
                })
                .then(() => {
                  this.setState(
                    {
                      email: "",
                      name: "",
                      password: "",
                      authenticating: false,
                    },
                    () => window.history.back()
                  );
                })
                .catch((err) => toaster.notify(err.message));
            } else {
              window.history.back();
            }
          });
      })
      .catch((err) => toaster.notify(err.message));
  };

  // handleFacebookLogin = () => {
  //   var provider = new firebase.auth.FacebookAuthProvider();
  //   provider.setCustomParameters({
  //     display: "popup",
  //     login_hint: "user@example.com",
  //   });
  //   firebase
  //     .auth()
  //     .signInWithPopup(provider)
  //     .then((result) => {
  //       console.log(result);
  //       var credential = result.credential;
  //       var token = result.credential.accessToken;
  //       var user = result.user;
  //       firebase
  //         .firestore()
  //         .collection("users")
  //         .where("email", "==", user.email)
  //         .get()
  //         .then((snap) => {
  //           if (snap.size === 0) {
  //             firebase
  //               .firestore()
  //               .collection("users")
  //               .add({
  //                 name: user.displayName,
  //                 email: user.email,
  //                 address: [],
  //                 orders: [],
  //                 alt: "",
  //                 cart: [],
  //                 dob: [],
  //                 wishlist: [],
  //                 phone: "",
  //               })
  //               .then(() => {
  //                 this.setState({
  //                   email: "",
  //                   name: "",
  //                   password: "",
  //                 });
  //                 window.location.href = "/";
  //               });
  //           } else {
  //             window.location.href = "/";
  //           }
  //         });
  //     })
  //     .catch((err) => console.log(err));
  // };

  handleLogin = () => {
    this.setState({
      authenticating: true,
    });
    if (
      this.state.login_email.length > 0 &&
      this.state.login_email.includes("@") &&
      this.state.login_password.length > 0
    ) {
      firebase
        .firestore()
        .collection("users")
        .where("email", "==", this.state.login_email)
        .get()
        .then((snap) => {
          if (snap.size > 0) {
            firebase
              .auth()
              .signInWithEmailAndPassword(
                this.state.login_email,
                this.state.login_password
              )
              .then(() => {
                this.setState({
                  authenticating: false,
                });
                window.history.back();
              })
              .catch((err) => {
                toaster.notify("Something went wrong!");
                console.log(err);
                this.setState({
                  authenticating: false,
                });
              });
          } else {
            toaster.notify("User Doesn't exists, Please Register!");
            this.setState({
              authenticating: false,
            });
          }
        })
        .catch((err) => {
          toaster.notify("Something went wrong!");
          console.log(err);
          this.setState({ authenticating: false });
        });
    } else {
      var error = {};
      if (this.state.login_email.length === 0) {
        error = {
          input: "login_email",
          msg: "Please enter Email!",
        };
        this.setState({
          error,
        });
      } else if (!this.state.login_email.includes("@")) {
        error = {
          input: "login_email",
          msg: "Please enter correct Email!",
        };
        this.setState({
          error,
        });
      } else {
        error = {
          input: "login_password",
          msg: "Please enter password!",
        };
        this.setState({
          error,
        });
      }
      this.setState({
        authenticating: false,
      });
    }
  };

  handleReset = () => {
    firebase
      .auth()
      .sendPasswordResetEmail(this.state.email)
      .then(() => {
        this.setState({ resetDone: true });
        setTimeout(() => {
          this.setState({
            email: "",
            password: "",
            resetDone: false,
            reset: false,
          });
        }, 2000);
      })
      .catch((err) => {
        console.log(err.message);
        toaster.notify("Something went wrong!");
      });
  };

  render() {
    return (
      <div className="sign-in-page">
        <div
          className={
            !this.state.login ? "container right-panel-active" : "container"
          }
          id="container"
        >
          <div className="form-container sign-up-container">
            <form action="#">
              <h1 className="panel-heading create">Create Account</h1>
              <div className="social-container">
                {/* <a href="#" class="social" onClick={this.handleFacebookLogin}>
                  <i class="fab fa-facebook-f"></i>
                </a> */}
                <button
                  type="button"
                  className="social"
                  onClick={this.handleGoogleLogin}
                >
                  <i className="fab fa-google-plus-g"></i>
                </button>
              </div>
              <span>or use your email for registration</span>
              <TextField
                type="text"
                variant="outlined"
                label="Name"
                size="small"
                className="input"
                name="name"
                value={this.state.name}
                onChange={this.handleChange}
                error={this.state.error.input === "name"}
                helperText={
                  this.state.error.input === "name" ? this.state.error.msg : ""
                }
              />
              <TextField
                type="text"
                label="Email"
                variant="outlined"
                className="input"
                size="small"
                name="email"
                value={this.state.email}
                onChange={this.handleChange}
                error={this.state.error.input === "email"}
                helperText={
                  this.state.error.input === "email" ? this.state.error.msg : ""
                }
              />
              <TextField
                type="number"
                label="Phone"
                variant="outlined"
                className="input"
                size="small"
                name="number"
                value={this.state.number}
                onChange={this.handleChange}
                error={this.state.error.input === "number"}
                helperText={
                  this.state.error.input === "number"
                    ? this.state.error.msg
                    : ""
                }
              />
              <TextField
                type="password"
                label="Password"
                size="small"
                name="password"
                className="input"
                variant="outlined"
                value={this.state.password}
                onChange={this.handleChange}
                error={this.state.error.input === "password"}
                helperText={
                  this.state.error.input === "password"
                    ? this.state.error.msg
                    : ""
                }
              />
              <button
                type="button"
                className="signup-btn"
                id="sign-in-button"
                onClick={this.handleRegister}
              >
                Sign Up
              </button>
            </form>
          </div>
          <div className="form-container sign-in-container">
            <form action="#">
              <h1 className="panel-heading">Sign in</h1>
              <div className="social-container">
                <button
                  type="button"
                  className="social"
                  onClick={this.handleGoogleLogin}
                >
                  <i className="fab fa-google-plus-g"></i>
                </button>
              </div>
              <span>or use your account</span>
              <TextField
                type="text"
                label="Email"
                variant="outlined"
                className="input"
                size="small"
                name="login_email"
                value={this.state.login_email}
                onChange={this.handleChange}
                error={this.state.error.input === "login_email"}
                helperText={
                  this.state.error.input === "login_email"
                    ? this.state.error.msg
                    : ""
                }
              />
              <TextField
                type="password"
                label="Password"
                size="small"
                name="login_password"
                className="input"
                variant="outlined"
                value={this.state.login_password}
                onChange={this.handleChange}
                error={this.state.error.input === "login_password"}
                helperText={
                  this.state.error.input === "login_password"
                    ? this.state.error.msg
                    : ""
                }
              />
              <p
                className="forgot"
                onClick={() => this.setState({ reset: true })}
              >
                Forgot your password?
              </p>
              <button type="button" onClick={this.handleLogin}>
                Sign In
              </button>
            </form>
          </div>
          <div className="overlay-container">
            <div className="overlay">
              <div className="overlay-panel overlay-left">
                <h1 style={{ letterSpacing: "3px" }}>Welcome Back!</h1>
                <p className="text">
                  To keep connected with us please login with your personal info
                </p>
                <button
                  className="ghost"
                  id="signIn"
                  onClick={() => {
                    this.setState({ login: true });
                  }}
                >
                  Sign In
                </button>
              </div>
              <div className="overlay-panel overlay-right">
                <h1 style={{ letterSpacing: "3px" }}>Hello, Friend!</h1>
                <p className="text">
                  Enter your personal details and start journey with us
                </p>
                <button
                  className="ghost"
                  id="signUp"
                  onClick={() => {
                    this.setState({ login: false });
                  }}
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="login" id="responsive-login">
          {this.state.sign ? (
            <div className="sign-in" id="sign-in">
              <h1>Sign in</h1>
              <div className="social-container">
                {/* <a href="#" class="social" onClick={this.handleFacebookLogin}>
                  <i class="fab fa-facebook-f"></i>
                </a> */}
                <button
                  type="button"
                  className="social"
                  onClick={this.handleGoogleLogin}
                >
                  <i className="fab fa-google-plus-g"></i>
                </button>
              </div>
              <p className="text">or use your account</p>
              <div className="inputs">
                <TextField
                  type="text"
                  label="Email"
                  variant="outlined"
                  className="inputField"
                  size="small"
                  name="login_email"
                  value={this.state.login_email}
                  fullWidth
                  onChange={this.handleChange}
                  error={this.state.error.input === "login_email"}
                  helperText={
                    this.state.error.input === "login_email"
                      ? this.state.error.msg
                      : ""
                  }
                />
                <TextField
                  type="password"
                  label="Password"
                  size="small"
                  name="login_password"
                  className="inputField"
                  variant="outlined"
                  fullWidth
                  value={this.state.login_password}
                  onChange={this.handleChange}
                  error={this.state.error.input === "login_password"}
                  helperText={
                    this.state.error.input === "login_password"
                      ? this.state.error.msg
                      : ""
                  }
                />
              </div>

              <p
                className="forgot"
                onClick={() => this.setState({ reset: true })}
              >
                Forgot your password?
              </p>
              <button type="button" onClick={this.handleLogin}>
                Sign In
              </button>
              <p
                className="forgot-password"
                onClick={() => {
                  this.setState({ sign: !this.state.sign });
                }}
              >
                Dont have an account ? <span>Sign up</span>
              </p>
            </div>
          ) : (
            <div className="sign-up">
              <h1>Create Account</h1>
              <div className="social-container">
                {/* <a href="#" class="social" onClick={this.handleFacebookLogin}>
                  <i class="fab fa-facebook-f"></i>
                </a> */}
                <button
                  type="button"
                  className="social"
                  onClick={this.handleGoogleLogin}
                >
                  <i className="fab fa-google-plus-g"></i>
                </button>
              </div>
              <p className="text">or use your email for registration</p>
              <div className="inputs">
                <TextField
                  type="text"
                  variant="outlined"
                  label="Name"
                  size="small"
                  className="inputField"
                  name="name"
                  fullWidth
                  value={this.state.name}
                  onChange={this.handleChange}
                  error={this.state.error.input === "name"}
                  helperText={
                    this.state.error.input === "name"
                      ? this.state.error.msg
                      : ""
                  }
                />
                <TextField
                  type="text"
                  label="Email"
                  variant="outlined"
                  className="inputField"
                  size="small"
                  name="email"
                  fullWidth
                  value={this.state.email}
                  onChange={this.handleChange}
                  error={this.state.error.input === "email"}
                  helperText={
                    this.state.error.input === "email"
                      ? this.state.error.msg
                      : ""
                  }
                />
                <TextField
                  type="number"
                  label="Phone"
                  size="small"
                  name="number"
                  className="inputField"
                  variant="outlined"
                  fullWidth
                  value={this.state.number}
                  onChange={this.handleChange}
                  error={this.state.error.input === "number"}
                  helperText={
                    this.state.error.input === "number"
                      ? this.state.error.msg
                      : ""
                  }
                />
                <TextField
                  type="password"
                  label="Password"
                  size="small"
                  name="password"
                  className="inputField"
                  variant="outlined"
                  fullWidth
                  value={this.state.password}
                  onChange={this.handleChange}
                  error={this.state.error.input === "password"}
                  helperText={
                    this.state.error.input === "password"
                      ? this.state.error.msg
                      : ""
                  }
                />
              </div>

              <button
                type="button"
                className="signup-btn"
                id="sign-in-button"
                onClick={this.handleRegister}
              >
                Sign Up
              </button>
              <p
                className="forgot-password"
                onClick={() => {
                  this.setState({ sign: !this.state.sign });
                }}
              >
                Already have an account ? Sign in
              </p>
            </div>
          )}
        </div>
        <Modal
          open={this.state.reset}
          onClose={() => this.setState({ reset: false })}
          className="modal"
        >
          <div className="reset-modal">
            <div className="head">
              <h4>Reset Password</h4>
              <img
                src={close}
                alt=""
                onClick={() => this.setState({ reset: false })}
              />
            </div>
            <div className="body">
              <TextField
                variant="outlined"
                size="small"
                fullWidth
                className="input"
                label="Enter Registered Email"
                name="email"
                value={this.state.email}
                onChange={this.handleChange}
                helperText={
                  this.state.resetDone
                    ? `An Email has been sent to ${this.state.email}`
                    : null
                }
              />
              <Button
                variant="outlined"
                color="primary"
                onClick={this.handleReset}
              >
                Reset
              </Button>
            </div>
          </div>
        </Modal>
        <Backdrop className="backdrop" open={this.state.authenticating}>
          <CircularProgress color="inherit" />
        </Backdrop>
      </div>
    );
  }
}
