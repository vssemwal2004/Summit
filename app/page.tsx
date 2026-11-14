import Navbar from "@/components/Navbar";
import ScrollProgress from "@/components/ScrollProgress";
import Cursor from "@/components/Cursor";
import Motion from "@/components/Motion";
import Hero from "@/components/Hero";
import Introduction from "@/components/Introduction";
import Architecture from "@/components/Architecture";
import Commercial from "@/components/Commercial";
import Residences from "@/components/Residences";
import Amenities from "@/components/Amenities";
import Gallery from "@/components/Gallery";
import Location from "@/components/Location";
import Legacy from "@/components/Legacy";
import Closing from "@/components/Closing";
import Enquiry from "@/components/Enquiry";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <a
        href="#main"
        className="fixed left-4 top-4 z-[100] -translate-y-24 bg-gold px-4 py-3 text-xs tracking-[0.2em] text-obsidian focus:translate-y-0"
      >
        SKIP TO CONTENT
      </a>
      <ScrollProgress />
      <Navbar />
      <main id="main">
        <Hero />
        <Introduction />
        <Architecture />
        <Commercial />
        <Residences />
        <Amenities />
        <Gallery />
        <Location />
        <Legacy />
        <Closing />
        <Enquiry />
      </main>
      <Footer />
      <Motion />
      <Cursor />
    </>
  );
}
