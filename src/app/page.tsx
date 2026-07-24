import HeroDistortion from "./components/HeroDistortion";
import SimpleNav from "./components/SimpleNav";
import AfterHero from "./components/after-hero";
import DiscountButton from "./components/discount-button";
import FeaturedProducts from "./components/featured-products";
import PromoMarquee from "./components/hero-marquee";
import RitualStack from "./components/pin-zoom-section";
import ScrollPinnedGallery from "./components/scroll-pinned-gallery";

export default function Home() {
  return (
    <div>
      <SimpleNav title="ELGEECOSMETICS" showCart={false} />

      <section className="relative h-screen w-full overflow-hidden">
        <DiscountButton />
        <HeroDistortion
          className="absolute inset-0"
          parallax={false}
          rippleStrength={0.35}
          rippleFrequency={10}
          rippleSpeed={5}
          rippleLife={0.4}
          rippleFalloff={3.5}
          rippleSpacing={0.12}
          mobileZoom={1.18}
          src="https://s9fz1hrsic.ufs.sh/f/3l7D2bitUmW6aZVo4L0pl8TuCgV5PRJXmS0qsMWQAtkZhOyK"
        />
        <div className="absolute inset-0 bg-black/20 z-[1] pointer-events-none" />
        <div className="z-10 flex relative h-screen flex-col px-4 sm:px-18 py-20 items-center justify-center text-center text-white pointer-events-none">
          <div className="absolute inset-0 lg:mt-14 mt-60 flex items-center justify-center h-screen flex-col w-full px-4 ">
            <div className="flex items-center font-medium justify-between w-full mb-4 text-xs sm:text-base">
              <p>E-COMMERCE</p>
              <p>COSMETICS</p>
              <p>LIGHTS</p>
            </div>
            <hr className="w-full border-dotted text-white" />
          </div>
          <h1 className="absolute bottom-5 
  sm:bottom-18 
  lg:bottom-7 font-normal text-[10vw] lg:text-[10.5vw] tracking-wide text-center whitespace-nowrap">
            ELGEECOSMETICS
          </h1>
        </div>
      </section>

      {/* rest of your page */}
      <PromoMarquee />
      <AfterHero />
       <RitualStack
  panels={[
    { eyebrow: 'Ritual 01', title: 'Skin Care', subtitle: 'Smooth body', image: 'https://s9fz1hrsic.ufs.sh/f/3l7D2bitUmW6GBXgewQ8Pa1KWLSbXFdkm5f6p2txIJ7rqclM', thumbnail: 'https://picsum.photos/seed/skincare-thumb/400/300', bg: '#C19A6B', fg: '#1b3025', imageSide: 'left' },
    { eyebrow: 'Ritual 02', title: 'Hair Care', subtitle: 'Nourish & repair', image: 'https://s9fz1hrsic.ufs.sh/f/3l7D2bitUmW6KAucfGtf24i0TY5zEV1oSJUADRs6yZI7gMxk', thumbnail: 'https://picsum.photos/seed/haircare-thumb/400/300', bg: '#f3ded1', fg: '#3a2418', imageSide: 'right' },
    { eyebrow: 'Ritual 03', title: 'Body Care', subtitle: 'Renew from within', image: 'https://s9fz1hrsic.ufs.sh/f/3l7D2bitUmW6XUVXz49W6KiyeYObraul3LTRZ59NdkvnDIEG', thumbnail: 'https://picsum.photos/seed/bodycare-thumb/400/300', bg: '#e8d5c4', fg: '#241b3a', imageSide: 'left' },
  ]}
/>
    <ScrollPinnedGallery />
    <FeaturedProducts />
    </div>
  );
}