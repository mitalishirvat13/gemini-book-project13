import React, { useState, useEffect, useCallback, useRef } from 'react';

const slides = [
  { url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=1920&h=1080&fit=crop&auto=format' },
  { url: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1920&h=1080&fit=crop&auto=format' },
  { url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=1920&h=1080&fit=crop&auto=format' },
  { 
    url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=1920&h=1080&fit=crop&auto=format',
    quote: "A reader lives a thousand lives before he dies . . . The man who never reads lives only one.",
    author: "George R.R. Martin"
  },
  { 
    url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1920&h=1080&fit=crop&auto=format',
    quote: "Books are a uniquely portable magic.",
    author: "Stephen King"
  },
];

const ChevronLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
  </svg>
);

const ChevronRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
  </svg>
);


const ImageSlider: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const timerRef = useRef<number | null>(null);

    const goToPrevious = () => {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? slides.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const goToNext = useCallback(() => {
        const isLastSlide = currentIndex === slides.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    }, [currentIndex]);
    
    const goToSlide = (slideIndex: number) => {
        setCurrentIndex(slideIndex);
    };

    useEffect(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        timerRef.current = window.setTimeout(() => {
            goToNext();
        }, 5000);

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [goToNext]);

    return (
        <div className="h-80 md:h-96 lg:h-[32rem] w-full mx-auto relative group rounded-2xl overflow-hidden shadow-lg">
            {/* Slides container */}
            <div className="w-full h-full">
                {slides.map((slide, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                    >
                        <img 
                            src={slide.url} 
                            alt={`Library slide ${index + 1}`} 
                            className={`w-full h-full object-cover transition-transform ease-linear duration-[6000ms] ${index === currentIndex ? 'scale-110' : 'scale-100'}`} 
                        />
                        <div className="absolute inset-0 bg-black/40"></div>
                        {slide.quote && (
                            <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-8 z-20 text-white">
                                <blockquote className="max-w-3xl">
                                    <p className="text-3xl md:text-4xl lg:text-5xl font-['Georgia',_serif] italic mb-4 text-shadow-md">
                                        “{slide.quote}”
                                    </p>
                                </blockquote>
                                <cite className="text-lg md:text-xl font-semibold mt-2 text-shadow">
                                    — {slide.author}
                                </cite>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            
            {/* Left Arrow */}
            <button onClick={goToPrevious} className="absolute top-1/2 -translate-y-1/2 left-4 z-20 p-2 bg-black/30 rounded-full text-white hover:bg-black/50 transition opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none">
                <ChevronLeftIcon className="h-6 w-6" />
            </button>
            
            {/* Right Arrow */}
            <button onClick={goToNext} className="absolute top-1/2 -translate-y-1/2 right-4 z-20 p-2 bg-black/30 rounded-full text-white hover:bg-black/50 transition opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none">
                <ChevronRightIcon className="h-6 w-6" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {slides.map((_, slideIndex) => (
                    <button 
                        key={slideIndex} 
                        onClick={() => goToSlide(slideIndex)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${currentIndex === slideIndex ? 'bg-white scale-110' : 'bg-white/50 hover:bg-white/75'}`} 
                        aria-label={`Go to slide ${slideIndex + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};
export default ImageSlider;