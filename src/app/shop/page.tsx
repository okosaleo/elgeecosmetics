
import DiscountButton from '../components/discount-button'
import HeroDistortion from '../components/HeroDistortion'
import SimpleNav from '../components/SimpleNav'
import ShopProducts from './components/shop-products'

export default function Shop() {
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
          src="https://s9fz1hrsic.ufs.sh/f/3l7D2bitUmW6PqIFGceYJBUGEIyvhiKdXcm7gopOCQ6fa2tq"
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
          <h1 className="absolute bottom-5 sm:bottom-18 lg:bottom-7 font-normal text-[10vw] lg:text-[10.5vw] tracking-wide text-center whitespace-nowrap">
            SHOP ALL
          </h1>
        </div>
      </section>

      <ShopProducts />
    </div>
  )
}