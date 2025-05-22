import React, { Component } from "react";
import Slider from "../../components/homepage/slider/slider";
import Categories from "../../components/homepage/category/category";
import Bottomslider from "../../components/homepage/bottomslider/bottomslider";
import About from "../../components/homepage/about/about";
import Perfect from "../../components/homepage/perfect/perfect";
import Lense from "../../components/homepage/lense/lense";
import Buypage from "../../components/homepage/buypage/buypage";
import OurService from "../../components/homepage/ourService/ourService";
import Loader from "../../components/loader/loader";
import "./homepage.css";
import firebase from "firebase";

export default class Homepage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {},
      categories: [],
      addSlider: [],
      products: [],
      categorySlider: {},
      subcategorySlider: {},
      loading: true,
    };
  }
  componentDidMount() {
    firebase
      .firestore()
      .collection("settings")
      .get()
      .then((snap) =>
        snap.forEach((doc) => {
          this.setState({
            categories: doc.data().categories,
            addSlider: doc.data().addSection,
          });
        })
      );
    firebase
      .firestore()
      .collection("products")
      .get()
      .then((snap) => {
        var products = [];
        snap.forEach((doc) => {
          if (doc.data().sold > 1) {
            products.push({
              ...doc.data(),
              id: doc.id,
            });
          }
        });
        this.setState({
          products: products.sort((a, b) => b.sold - a.sold),
        });
      });
    var categorySlider = [];
    var subcategorySlider = [];
    firebase
      .firestore()
      .collection("settings")
      .get()
      .then((snap) => {
        if (snap.size > 0) {
          snap.forEach((doc) => {
            var category =
              doc.data().categories[
                Math.floor(Math.random() * doc.data().categories.length)
              ];
            var subcategory =
              doc.data().categories[
                Math.floor(Math.random() * doc.data().categories.length)
              ].subcategories[
                Math.floor(Math.random() * category.subcategories.length)
              ];
            firebase
              .firestore()
              .collection("products")
              .get()
              .then((snap) => {
                snap.forEach((doc) => {
                  if (doc.data().category === category?.name) {
                    categorySlider.push({ ...doc.data(), id: doc.id });
                  }
                  if (doc.data().subcategory === subcategory?.name) {
                    subcategorySlider.push({ ...doc.data(), id: doc.id });
                  }
                });
                this.setState({
                  categorySlider: {
                    name: category?.name,
                    list: categorySlider,
                  },
                  subcategorySlider: {
                    name: subcategory?.name,
                    list: subcategorySlider,
                  },
                  loading: false,
                });
              });
          });
        } else {
          this.setState({
            loading: false,
          });
        }
      });
  }
  render() {
    return (
      <>
        {this.state.loading ? (
          <Loader />
        ) : (
          <div className="homepage">
            <Slider addSlider={this.state.addSlider} />
            <Categories categories={this.state.categories} />
            <Perfect />
            {this.state.products ? (
              <Bottomslider name="best seller" products={this.state.products} />
            ) : null}
            <Lense />
            <About />
            {this.state.categorySlider.list?.length > 0 && (
              <Bottomslider
                name={`From ${this.state.categorySlider.name}`}
                products={this.state.categorySlider.list}
              />
            )}
            <Buypage />

            <OurService />

            {/* {this.state.subcategorySlider.list?.length > 0 && (
              <Bottomslider
                name={`From ${this.state.subcategorySlider.name}`}
                products={this.state.subcategorySlider.list}
              />
            )} */}
          </div>
        )}
      </>
    );
  }
}
