import React, { useState } from "react";
import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/thumbs"; // Import Thumbs CSS
import "swiper/css/navigation"; // Import Navigation CSS
import "swiper/css/autoplay"; // Import Autoplay CSS

import { EffectCoverflow, Autoplay, Navigation } from "swiper/modules";

import "swiper/css/effect-coverflow";
import "swiper/css/navigation";

// Initialize SwiperCore to use these modules

function Slider() {
  const [thumbsSwiper, setThumbsSwiper] = useState(null); // Set up state for thumbsSwiper

  // Sample image URLs
  const images = [
    { src: "/newyork.jpg", link: "/deliveries", title: "New York" },
    { src: "/washington.jpg", link: "/deliveries", title: "Washington" },
    { src: "/chicago.jpg", link: "/deliveries", title: "chicago" },
    { src: "/newjersey.jpg", link: "/deliveries", title: "New jersey" },
  ];
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  return (
    <div
      className="container relative py-5"
      style={{ width: "80%", margin: "0 auto" }}
    >
      {/* button for slider ended */}

      {/* Thumbnails Swiper */}
      <Swiper
        effect="coverflow"
        grabCursor={true}
        centeredSlides={true}
        slidesPerView={window.innerWidth < 768 ? 1 : 3}
        loop={true}
        autoplay={{
          delay: 2000,
          disableOnInteraction: false,
        }}
        coverflowEffect={{
          rotate: 50,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: true,
        }}
        navigation
        modules={[EffectCoverflow, Autoplay, Navigation]}
        className="mySwiper"
        style={{ paddingBottom: "40px" }}
      >
        {images.map((img, index) => (
          <SwiperSlide key={index}>
            <a href={img.link}>
              <img
                src={img.src}
                alt={`Slide ${index}`}
                style={{
                  width: "100%",
                  borderRadius: "12px",
                  height: "auto",
                  cursor: "pointer",
                }}
              />
            </a>
            <p
              style={{
                textAlign: "center",
                marginTop: "10px",
                fontWeight: "bold",
                backgroundColor: "#f7b614",
              }}
            >
              {img.title}
            </p>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default Slider;
