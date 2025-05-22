import React, { Component } from 'react';
import firebase from 'firebase';
import { Avatar, Chip, ClickAwayListener, Tooltip } from '@material-ui/core';
import './categoryPage.css';
import Card from '../../components/card/card';
import Loader from '../../components/loader/loader';
export default class CategoryPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hub: [],
      categories: [],
      name: '',
      title: '',
      image: '',
      products: [],
      productCounts: {},
      subcategories: [],
      loading: true,
      subName: null,
      subImage: null,
      sortModal: false,
      sortValue: 'relevance',
    };
    this.scroll = React.createRef();
    this.scroll2 = React.createRef();
  }
  componentDidMount() {
    var products = [];
    firebase
      .firestore()
      .collection('settings')
      .get()
      .then(
        (snap) =>
          snap.forEach((doc) =>
            this.setState({
              categories: doc.data().categories,
            })
          ),
        firebase
          .firestore()
          .collection('products')
          .get()
          .then((snap) => {
            snap.forEach((doc) => {
              var product = doc.data();
              product.id = doc.id;
              products.push(product);
            });
            console.log(
              this.state.categories?.find(
                (category) =>
                  category.name === this.props.location.state?.category
              )
            );
            this.setState({
              hub: products,
              loading: false,
              name:
                this.props.location.state?.category ||
                this.state.categories[0]?.name,
              title:
                this.props.location.state?.category ||
                this.state.categories[0]?.name,
              image:
                this.state.categories?.find(
                  (category) =>
                    category.name === this.props.location.state?.category
                )?.image || this.state.categories[0].image,
              // this.state.categories[
              //   this.props.location.state
              //     ? this.props.location.state.category
              //     : 0
              // ].image,
              subcategories:
                this.state.categories?.find(
                  (category) =>
                    category.name === this.props.location.state?.category
                )?.subcategories.length ||
                this.state.categories[0].subcategories.length,
            });
            var arr = [];
            var arr2 = [];
            var obj = {};
            this.state.hub.forEach((item) => {
              const discount = parseInt(
                ((item.variations[0].usual - item.variations[0].listing) /
                  item.variations[0].usual) *
                  100
              );
              obj = { ...item, discount };
              arr2.push(obj);
              this.state.name === item.category && arr.push(item);
            });
            this.setState({ products: arr, hub: arr2 });

            var product_counts = {};
            this.state.hub.forEach((product) => {
              if (!Object.keys(product_counts).includes(product.category)) {
                product_counts = {
                  ...product_counts,
                  [product.category]: 1,
                };
              } else {
                product_counts = {
                  ...product_counts,
                  [product.category]: product_counts[product.category] + 1,
                };
              }
              // console.log(product_counts);

              if (!Object.keys(product_counts).includes(product.subcategory)) {
                product_counts = {
                  ...product_counts,
                  [product.subcategory]: 1,
                };
              } else {
                product_counts = {
                  ...product_counts,
                  [product.subcategory]:
                    product_counts[product.subcategory] + 1,
                };
              }
            });
            this.setState({ productCounts: product_counts });
          })
      );
  }

  // functions

  handleSort = (event) => {
    this.setState(
      {
        loading: true,
        sortValue: event.target.value,
      },
      () => {
        var arr = this.state.products;
        if (this.state.sortValue === 'relevance') {
          var arr2 = [];
          if (this.state.subName) {
            this.state.hub.forEach((item) => {
              if (
                item.category === this.state.name &&
                item.subcategory === this.state.subName
              )
                arr2.push(item);
            });
          } else {
            this.state.hub.forEach((item) => {
              if (item.category === this.state.name) arr2.push(item);
            });
          }
          this.setState({ products: arr2 });
        } else if (this.state.sortValue === 'price-low') {
          arr.sort((a, b) =>
            a.variations[0].listing > b.variations[0].listing ? 1 : -1
          );
          this.setState({ products: arr });
        } else if (this.state.sortValue === 'price-high') {
          arr.sort((a, b) =>
            a.variations[0].listing < b.variations[0].listing ? 1 : -1
          );
          this.setState({ products: arr });
        } else if (this.state.sortValue === 'new') {
          arr.sort((a, b) => (a.date < b.date ? 1 : -1));
          this.setState({ products: arr });
        } else if (this.state.sortValue === 'discount') {
          arr.sort((a, b) => (a.discount < b.discount ? 1 : -1));
          this.setState({ products: arr });
        }
        this.setState({ loading: false });
      }
    );
  };

  handleCategory = () => {
    this.setState({ loading: true }, () => {
      var arr = [];
      this.state.hub.forEach((item) => {
        this.state.name === item.category && arr.push(item);
      });
      //   this.handleReset(this.state.catIndex);
      this.setState({ products: arr, loading: false });
    });
  };

  handleSubCategory = () => {
    this.setState({ loading: true }, () => {
      var arr = [];
      this.state.hub.forEach((item) => {
        this.state.subName === item.subcategory && arr.push(item);
      });
      this.setState({ products: arr, loading: false });
    });
  };
  move = () => {
    this.scroll.current.scrollLeft += 300;
  };
  move2 = () => {
    this.scroll2.current.scrollLeft += 300;
  };
  render() {
    var sub = [];
    this.state.categories.forEach((item) =>
      item.name === this.state.name ? (sub = item.subcategories) : null
    );
    return (
      <>
        {this.state.loading ? (
          <Loader />
        ) : (
          <div className="products-page">
            <div className="products-top">
              {/* categories */}
              <div className="category-list">
                <h4>Categories </h4>
                <div className="inner-list">
                  <Tooltip title={this.state.name}>
                    <Chip
                      style={{ marginRight: 10 }}
                      label={this.state.name}
                      className="trunket"
                      avatar={<Avatar alt="category" src={this.state.image} />}
                      onClick={() =>
                        this.setState(
                          {
                            subName: null,
                          }
                          // () => {
                          //   this.handleCategory();
                          // }
                        )
                      }
                    />
                  </Tooltip>

                  <div className="items" id="items" ref={this.scroll}>
                    {this.state.categories.map((cat, index) =>
                      this.state.name !== cat.name ? (
                        <div style={{ display: 'inline' }}>
                          <Chip
                            className="chip"
                            avatar={<Avatar alt="category" src={cat.image} />}
                            label={cat.name}
                            variant="outlined"
                            onClick={() =>
                              this.setState(
                                {
                                  name: cat.name,
                                  title: cat.name,
                                  image: cat.image,
                                  catIndex: index,
                                  subName: null,
                                  subImage: null,
                                },
                                () => {
                                  this.handleCategory();
                                }
                              )
                            }
                            key={index}
                          />
                        </div>
                      ) : null
                    )}
                  </div>
                  {this.state.categories.length > 7 ? (
                    <i
                      className="fas fa-angle-double-right"
                      style={{ marginLeft: 10 }}
                      onClick={this.move}
                    ></i>
                  ) : null}
                </div>
              </div>

              {/* subcategories */}
              {sub.length > 0 ? (
                <div className="category-list">
                  <h4>Sub-Categories </h4>
                  <div className="inner-list">
                    {this.state.subName ? (
                      <Tooltip title={this.state.subName}>
                        <Chip
                          label={this.state.subName}
                          style={{ marginRight: 10 }}
                          className="trunket"
                          avatar={
                            <Avatar alt="category" src={this.state.subImage} />
                          }
                        />
                      </Tooltip>
                    ) : null}
                    <div className="items" id="items" ref={this.scroll2}>
                      {sub.map((item, index) =>
                        this.state.subName !== item.name ? (
                          <span
                            style={{ position: 'relative', display: 'flex' }}
                          >
                            <Chip
                              avatar={
                                <Avatar alt="category" src={item.image} />
                              }
                              label={item.name}
                              variant="outlined"
                              onClick={() => {
                                this.setState(
                                  {
                                    title: item.name,
                                    subImage: item.image,
                                    subName: item.name,
                                  },
                                  () => {
                                    this.handleSubCategory();
                                  }
                                );
                              }}
                            />
                            <span className="badge">
                              {Object.keys(this.state.productCounts).includes(
                                item.name
                              )
                                ? this.state.productCounts[item.name]
                                : 0}
                            </span>
                          </span>
                        ) : null
                      )}
                    </div>
                    {sub.length > 7 ? (
                      <i
                        className="fas fa-angle-double-right"
                        style={{ marginLeft: 10 }}
                        onClick={this.move2}
                      ></i>
                    ) : null}
                  </div>
                </div>
              ) : (
                <h1
                  style={{
                    height: 53,
                    margin: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    borderBottom: '1px solid #707070',
                    width: '100%',
                    fontWeight: '700',
                    color: '#707070',
                    fontSize: '18px',
                  }}
                >
                  Currently No Sub Categories Available
                </h1>
              )}
            </div>
            <div className="breadcrumb-section">
              <div className="breadcrumb">
                <a href="/">home</a> -
                <p
                  onClick={() => {
                    this.handleCategory();
                    this.setState({
                      subName: null,
                    });
                  }}
                >
                  {this.state.name}
                </p>
                {this.state.subName ? (
                  <>
                    - <p>{this.state.subName}</p>
                  </>
                ) : null}
              </div>
              <ClickAwayListener
                onClickAway={() => this.setState({ sortModal: false })}
              >
                <div style={{ position: 'relative' }}>
                  <button
                    className="sortButton"
                    onClick={() => {
                      this.setState({ sortModal: !this.state.sortModal });
                    }}
                  >
                    Sort
                    <i className="fas fa-caret-down "></i>
                  </button>
                  <i
                    class="fas fa-sort-amount-up sortIcon"
                    onClick={() => {
                      this.setState({ sortModal: !this.state.sortModal });
                    }}
                  ></i>
                  {this.state.sortModal ? (
                    <div className="sort-wrapper">
                      <h3>Sort</h3>
                      <div className="options">
                        <label>
                          <input
                            type="radio"
                            value="relevance"
                            checked={this.state.sortValue === 'relevance'}
                            onClick={(e) => {
                              this.handleSort(e);
                              this.setState({ sortModal: false });
                            }}
                          />
                          Relevance
                        </label>
                        <label>
                          <input
                            type="radio"
                            value="price-low"
                            checked={this.state.sortValue === 'price-low'}
                            onClick={(e) => {
                              this.handleSort(e);
                              this.setState({ sortModal: false });
                            }}
                          />
                          Price (lowest first)
                        </label>{' '}
                        <label>
                          <input
                            type="radio"
                            value="price-high"
                            checked={this.state.sortValue === 'price-high'}
                            onClick={(e) => {
                              this.handleSort(e);
                              this.setState({ sortModal: false });
                            }}
                          />
                          Price (highest first)
                        </label>
                        <label>
                          <input
                            type="radio"
                            value="new"
                            checked={this.state.sortValue === 'new'}
                            onClick={(e) => {
                              this.handleSort(e);
                              this.setState({ sortModal: false });
                            }}
                          />
                          What's New
                        </label>
                        <label>
                          <input
                            type="radio"
                            value="discount"
                            checked={this.state.sortValue === 'discount'}
                            onClick={(e) => {
                              this.handleSort(e);
                              this.setState({ sortModal: false });
                            }}
                          />
                          Discount
                        </label>
                      </div>
                    </div>
                  ) : null}
                </div>
              </ClickAwayListener>
            </div>
            <div className="cardlist">
              {this.state.products.length > 0 ? (
                this.state.products.map((item, index) => (
                  <>
                    <Card key={index} id={item.id} normal />
                  </>
                ))
              ) : (
                <h1
                  style={{
                    fontSize: '25px',
                    margin: '50px auto',
                    fontWeight: '700',
                    color: '#707070',
                    whiteSpace: 'nowrap',
                  }}
                >
                  No Products Available
                </h1>
              )}
            </div>
          </div>
        )}
      </>
    );
  }
}
