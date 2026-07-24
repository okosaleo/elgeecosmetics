import Marquee from "react-fast-marquee";

const PromoMarquee = () => {
  return (
    <Marquee
      autoFill
      speed={50}
      pauseOnHover
      gradient={false}
      className="bg-orange-300 py-5"
    >
      <span className="mx-6 md:text-4xl text-3xl font-medium uppercase tracking-wide text-neutral-900">
        New In
      </span>
      <span className="mx-6 md:text-4xl text-3xl font-medium uppercase tracking-wide text-neutral-900">
        *
      </span>
      <span className="mx-6 md:text-4xl text-3xl font-medium uppercase tracking-wide text-neutral-900">
        20% Discount
      </span>
      <span className="mx-6 md:text-4xl text-3xl font-medium uppercase tracking-wide text-neutral-900">
        *
      </span>
    </Marquee>
  );
};

export default PromoMarquee;