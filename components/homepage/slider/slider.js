import React, { Component } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Autoplay } from "swiper";
import "swiper/swiper.scss";
import "./slider.css";
export default class Slider extends Component {
  render() {
    SwiperCore.use([Autoplay]);
    return (
      <>
        {this.props.addSlider ? (
          <div className="slider">
            <Swiper
              spaceBetween={50}
              slidesPerView={1.1}
              loop={true}
              autoplay={{
                delay: 4000,
                disableOnInteraction: false,
              }}
            >
              {this.props.addSlider?.map((add) => (
                <SwiperSlide>
                  <a
                    style={{ cursor: "pointer" }}
                    href={add.link ? add.link : "#"}
                  >
                    <img src={add.image} alt="" />
                  </a>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        ) : null}
      </>
    );
  }
}
