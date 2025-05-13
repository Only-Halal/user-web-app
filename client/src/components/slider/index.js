import React, { useState } from "react";
import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Thumbs } from "swiper/modules";
import { Navigation } from "swiper/modules";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/thumbs"; // Import Thumbs CSS
import "swiper/css/navigation"; // Import Navigation CSS
import "swiper/css/autoplay"; // Import Autoplay CSS

// Initialize SwiperCore to use these modules

function Slider() {
  const [thumbsSwiper, setThumbsSwiper] = useState(null); // Set up state for thumbsSwiper

  // Sample image URLs
  const images = [
    "/newyork.jpg",
    "/washington.jpg",
    "/chicago.jpg",
    "/newjersey.jpg",
    "/usa.jpg",
    "/arizona.jpg",
    "/newyork.jpg",
    "/washington.jpg",
  ];
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  return (
    <div
      className="container relative"
      style={{ width: "80%", margin: "0 auto" }}
    >
      {/* cutome button started */}
      <button ref={prevRef} className="swiper-button-prev slider-nav"></button>
      <button ref={nextRef} className="swiper-button-next slider-nav"></button>

      {/* button for slider ended */}

      {/* Thumbnails Swiper */}
      <Swiper
        onSwiper={setThumbsSwiper}
        modules={[Thumbs, Autoplay, Navigation]}
        spaceBetween={10}
        slidesPerView={4}
        watchSlidesProgress
        autoplay={{
          delay: 1000,
          disableOnInteraction: false,
        }}
        loop={true}
        navigation={{
          prevEl: prevRef.current,
          nextEl: nextRef.current,
        }}
        onBeforeInit={(swiper) => {
          swiper.params.navigation.prevEl = prevRef.current;
          swiper.params.navigation.nextEl = nextRef.current;
        }}
        breakpoints={{
          0: {
            slidesPerView: 2,
          },
          768: {
            slidesPerView: 2,
          },
          1024: {
            slidesPerView: 3,
          },
        }}
        style={{ marginTop: "10px" }}
      >
        {images.map((img, index) => (
          <SwiperSlide key={index}>
            <img
              src={img}
              alt={`Thumb ${index + 1}`}
              style={{
                width: "100%",
                borderRadius: "8px",
                cursor: "pointer",
                height: "auto",
              }}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default Slider;
