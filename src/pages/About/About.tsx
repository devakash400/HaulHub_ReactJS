import React from "react";
import { ThumbsUp, Lock, Check } from "lucide-react";
import fallbackImage from "../../assets/images/modallogo.png";

const About: React.FC = () => {
  const handleImgError: React.ReactEventHandler<HTMLImageElement> = (e) => {
    const img = e.currentTarget;
    if (img.src === fallbackImage) return;
    img.onerror = null;
    img.src = fallbackImage;
  };

  const gridImages = [
    "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=600&h=450&q=80",
    "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=600&h=450&q=80",
    "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=600&h=450&q=80&sat=-20",
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&h=450&q=80",
    "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=600&h=450&q=80&brightness=0.9",
    "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=600&h=450&q=80&sat=-10",
  ];

  return (
    <main className="min-h-screen w-full min-w-0 overflow-x-hidden bg-[#F6F1E8] font-sans">
      {/* Hero image - full viewport width, no sidebars */}
      <section className="relative w-full h-[260px] overflow-hidden bg-[#F6F1E8] sm:h-auto sm:min-h-[60vh]">
        <img
          src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1600&h=700&q=80"
          alt="Flatbed trailer and truck at construction site"
          loading="eager"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={handleImgError}
          className="h-full w-full object-cover object-center sm:min-h-[60vh]"
        />
      </section>

      {/* Content - contained for readability */}
      <div className="mx-auto max-w-[1120px]">
        {/* About Us - two columns: text left, image grid right */}
        <section className="px-6 py-10 sm:px-10 sm:py-14">
          <h1 className="mb-6 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            About Us
          </h1>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
            <div className="flex-1 space-y-4 text-base leading-relaxed text-neutral-800 sm:text-[1.05rem]">
              <p>
                HaulHub is a family-owned and operated trailer rental marketplace
                created to make hauling easier, more affordable, and more
                accessible for everyday people.
              </p>
              <p>
                The idea for HaulHub started with a young family who loved
                working on projects, traveling, and taking on new adventures but
                constantly needed different types of trailers for different
                situations. Purchasing every type of trailer wasn&apos;t
                practical or cost-effective, so we began renting trailers as
                needed to save money and simplify the process. That experience
                inspired us to build a better solution—a platform where people
                can easily rent the right trailer when they need it while
                allowing trailer owners to earn income by sharing equipment they
                already own.
              </p>
              <p>
                HaulHub connects renters and trailer owners through a simple,
                secure platform designed to support home owners, contractors,
                outdoor enthusiasts, and small businesses across local
                communities and eventually nationwide.
              </p>
            </div>
            <div className="grid w-full grid-cols-2 gap-2 sm:gap-3 lg:w-[320px] lg:shrink-0">
              {gridImages.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`Trailer and truck ${i + 1}`}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  onError={handleImgError}
                  className="aspect-[4/3] w-full rounded-lg bg-neutral-200 object-cover shadow-sm"
                />
              ))}
            </div>
          </div>
        </section>

        {/* Product Owner */}
        <section className="border-t border-neutral-200 px-6 py-10 sm:px-10 sm:py-14">
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Product Owner
          </h2>
          <p className="max-w-3xl text-base leading-relaxed text-neutral-800 sm:text-[1.05rem]">
            HaulHub&apos;s founding team brings together experience in
            technology and entrepreneurship. The Product Owner oversees platform
            development, user experience, safety policies, and marketplace
            operations. Angelina Houston is the owner of HaulHub.
          </p>
        </section>

        {/* Our Mission */}
        <section className="border-t border-neutral-200 px-6 py-10 sm:px-10 sm:py-14">
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Our Mission
          </h2>
          <p className="max-w-3xl text-base leading-relaxed text-neutral-800 sm:text-[1.05rem]">
            Our mission is to provide a convenient and dependable way for people
            to access trailers without the expense of ownership while helping
            owners maximize the value of their equipment.
          </p>
        </section>

        {/* Contact & Support */}
        <section className="border-t border-neutral-200 px-6 py-10 sm:px-10 sm:py-14">
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Contact &amp; Support
          </h2>
          <p className="mb-6 max-w-3xl text-base leading-relaxed text-neutral-800 sm:text-[1.05rem]">
            We believe transparency and accessibility are important. Users can
            contact <strong className="font-semibold text-neutral-900">HaulHub</strong> for
            support, questions, or feedback using the information below:
          </p>
          <ul className="mb-8 flex flex-col gap-3 text-base text-neutral-800 sm:text-[1.05rem]">
            <li className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#389131]/15 text-[#389131]">
                <ThumbsUp className="h-5 w-5" aria-hidden />
              </span>
              Supporting responsible rentals.
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#389131]/15 text-[#389131]">
                <Lock className="h-5 w-5" aria-hidden />
              </span>
              Protecting user information and privacy.
            </li>
            <li className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#389131]/15 text-[#389131]">
                <Check className="h-5 w-5" aria-hidden />
              </span>
              Continuously improving the platform experience.
            </li>
          </ul>
          <div className="rounded-lg border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm leading-relaxed text-amber-900">
            <p className="m-0">
              We want owners and customers to be able to send pictures in the
              app; the app will hold them until delivery is complete and the
              owner confirms the trailer is returned in the condition it was
              sent. The owner will then confirm the deposit is clear to be
              returned.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
};

export default About;
