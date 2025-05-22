import React, { useState } from "react";
import Slider from "react-slick";
import "./bottomslider.css";
import Card from "../../card/card";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Autoplay, Navigation } from "swiper";
export default function Bottomslider({ name, products }) {
  // document.getElementsByClassName("slick-track")[0].style.transform3d =
  //   (0, 0, 0);
  SwiperCore.use([Autoplay, Navigation]);

  const settings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,

    swipeToSlide: true,
    centerMode: false,
    responsive: [
      {
        breakpoint: 1380,
        settings: {
          slidesToShow: 5,
        },
      },
      {
        breakpoint: 1260,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 1100,
        settings: {
          slidesToShow: 3.8,
        },
      },
      {
        breakpoint: 840,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          arrows: false,
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 680,
        settings: {
          arrows: false,
          slidesToShow: 2.2,
        },
      },
      {
        breakpoint: 550,
        settings: {
          arrows: false,
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 468,
        settings: {
          arrows: false,
          slidesToShow: 1.6,
        },
      },

      {
        breakpoint: 390,
        settings: {
          arrows: false,
          slidesToShow: 1.4,
        },
      },
      {
        breakpoint: 350,
        settings: {
          arrows: false,
          slidesToShow: 1.4,
        },
      },
    ],
  };
  return (
    <div className="dynamic-slider">
      <div className="heading">
        <h1 className="">{name}</h1>
      </div>
      {products.length > 5 ? (
        <>
          <i className="fas fa-chevron-left" id="review-swiper-button-prev"></i>
          <i
            className="fas fa-chevron-right"
            id="review-swiper-button-next"
          ></i>
        </>
      ) : null}
      <Swiper
        navigation={{
          nextEl: "#review-swiper-button-next",
          prevEl: "#review-swiper-button-prev",
        }}
        breakpoints={{
          300: {
            width: 300,
            slidesPerView: 1.3,
          },
          600: {
            width: 600,
            slidesPerView: 2.5,
          },
          680: {
            width: 680,
            slidesPerView: 3,
          },
          850: {
            width: 850,
            slidesPerView: 4,
          },
          1150: {
            width: 1150,
            slidesPerView: 5,
          },
          1260: {
            width: 1260,
            slidesPerView: 5,
          },
        }}
      >
        {products.map((product) => (
          <SwiperSlide>
            <Card id={product.id} key={product.id} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
