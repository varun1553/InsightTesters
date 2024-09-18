import "react-responsive-carousel/lib/styles/carousel.min.css";
import "./Corousel.css";
import in1 from '../../images/in1.jpeg';
import in2 from '../../images/in2.jpeg';
import in3 from '../../images/in3.jpeg';
import in4 from '../../images/in4.jpeg';
import in5 from '../../images/in5.jpeg';

import { useEffect, useState } from "react";

const images = [
  in1,
  in2,
  in3,
  in4,
  in5
];

const Carousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const autoPlayInterval = setInterval(nextSlide, 3000);
    return () => {
      clearInterval(autoPlayInterval);
    };
  }, [3000]);

  const nextSlide = () => {
    setActiveIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };
  const prevSlide = () => {
    setActiveIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };
  return (
    <div className="carousel">
      <button onClick={prevSlide} className="carousel__btn carousel__btn--prev">
        &lt;
      </button>
      <img
        src={images[activeIndex]}
        alt={`Slide ${activeIndex}`}
        className="carousel__img"
      />
      <button onClick={nextSlide} className="carousel__btn carousel__btn--next">
        &gt;
      </button>
    </div>
  );
};
export default Carousel;