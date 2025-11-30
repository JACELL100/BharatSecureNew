import React, { useEffect, useRef, Suspense, lazy } from "react";
import { useLocation } from "react-router-dom";
import Hero from "../components/about-components/Hero.jsx";
import FloatingChatbot from "@/components/FloatingChatbot.jsx";

// Lazy load non-critical components
const Features = lazy(() =>
  import("../components/about-components/Features.jsx")
);
const Video = lazy(() => import("../components/about-components/Video.jsx"));
const AboutUsDetails = lazy(() =>
  import("../components/about-components/AboutUsDetails.jsx")
);
const Team = lazy(() => import("../components/about-components/Team.jsx"));
const Footer = lazy(() => import("../components/Footer.jsx"));

const AboutUs = () => {
  const featuresRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    // Scroll to the Features section if the hash is '#features'
    if (location.hash === "#features") {
      const offset = 60;
      const targetPosition =
        featuresRef.current?.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: targetPosition - offset, behavior: "smooth" });
    }
  }, [location]);

  const scrollToFeatures = () => {
    const offset = 60;
    const targetPosition =
      featuresRef.current?.getBoundingClientRect().top + window.pageYOffset;
    window.scrollTo({ top: targetPosition - offset, behavior: "smooth" });
  };

  return (
    <div style={{ fontFamily: "ubuntu", backgroundColor: "#0f0f0f" }}>
      <Hero onLearnMore={scrollToFeatures} />

      <Suspense
        fallback={
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-[#4da6a8] border-t-transparent rounded-full animate-spin"></div>
          </div>
        }
      >
        <AboutUsDetails />
      </Suspense>

      <Suspense
        fallback={
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-[#4da6a8] border-t-transparent rounded-full animate-spin"></div>
          </div>
        }
      >
        <Features ref={featuresRef} />
      </Suspense>

      <Suspense
        fallback={
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-[#4da6a8] border-t-transparent rounded-full animate-spin"></div>
          </div>
        }
      >
        <Video />
      </Suspense>

      <Suspense
        fallback={
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-[#4da6a8] border-t-transparent rounded-full animate-spin"></div>
          </div>
        }
      >
        <Team />
      </Suspense>

      <Suspense
        fallback={
          <div className="flex justify-center items-center h-64">
            <div className="w-8 h-8 border-4 border-[#4da6a8] border-t-transparent rounded-full animate-spin"></div>
          </div>
        }
      >
        <Footer />
      </Suspense>
      <FloatingChatbot/>
    </div>
  );
};

export default AboutUs;