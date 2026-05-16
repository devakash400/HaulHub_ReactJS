import React from "react";
import { ThumbsUp, Lock, Check } from "lucide-react";
import fallbackImage from "../../assets/images/modallogo.png";
import AboutImage from "../../assets/images/Abouuspic.png";

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
    <main className="min-h-screen w-full min-w-0 
    overflow-x-hidden bg-[#F6F1E8] font-sans">
      {/* Hero image - full viewport width, no sidebars */}
      <section className="relative w-full h-[501px] overflow-hidden bg-[#F6F1E8]">
      <img
  src={AboutImage}
  alt="Flatbed trailer and truck at construction site"
  onError={handleImgError}
  className="h-full w-full object-cover object-center"
/>
      </section>

      {/* Content - contained for readability */}
      <div className="w-full">
        {/* About Us - two columns: text left, image grid right */}
        <section className="px-6 py-10 sm:px-10"
         style={{ fontFamily: "Lexend, sans-serif" }}>
  
  <h1 className="mb-6 text-[32px] font-[400] leading-[140%] tracking-[0em] text-[#000000]">
    About 
  </h1>

  <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">

    <div className="flex-1 space-y-4 text-[25px] font-light leading-[140%] tracking-[0.01em] text-[#000000]">

      <p>
      HaulHub is a family-owned and operated trailer 
rental marketplace created to make hauling easier,
more affordable, and more accessible for everyday 
people.
 
      </p>

      <p>
      The idea for HaulHub started with a young family
who loved working on projects, traveling, and taking
on new adventures but constantly needed different
types of trailers for different situations. Purchasing
every type of trailer wasn’t practical or cost-effective,
so we began renting trailers as needed to save money
and simplify the process. That experience inspired us
to build a better solution  a platform where people 
can easily rent the right trailer when they need it while
 allowing trailer owners to earn income by sharing 
equipment they already own.
      </p>

      <p>
      HaulHub connects renters and trailer owners through
a simple, secure platform designed to support home
owners, contractors, outdoor enthusiasts, and small
businesses across local communities and eventually
nationwide.
 
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
        <section className=" px-6 py-10 sm:px-10 sm:py-14" style={{ fontFamily: "Lexend, sans-serif" }}>
        <h2 className="mb-4 font-lexend font-normal text-[32px] leading-[140%] tracking-[0em] text-[#000000]">
  Product Owner
</h2>
<p className="max-w-3xl font-lexend font-light text-[25px] leading-[140%] tracking-[0.01em] text-[#000000]">
HaulHub is owned and operated by the HaulHub 
founding team, a family-run business focused on 
building reliable, community-driven solutions through
technology and entrepreneurship. The Product Owner
oversees platform development, user experience, safety
policies, and overall marketplace operations to ensure
a trustworthy and user-friendly experience. The owner 
of Haul Hub is Angelina Houston.
          </p>
        </section>

        {/* Our Mission */}
        <section className=" px-6 py-10 sm:px-10 sm:py-14"
         style={{ fontFamily: "Lexend, sans-serif" }}>
         <h2 className="mb-4 font-lexend font-normal text-[32px] leading-[140%] tracking-[0em] text-[#000000]">
  Our Mission
</h2>
<p className="max-w-3xl font-lexend font-light text-[25px] leading-[140%] tracking-[0.01em] text-[#000000]">
Our mission is to provide a convenient and dependable way for people to access trailers without the expense of ownership 
while helping owners maximize the value of their equipment.
          </p>
        </section>

        {/* Contact & Support */}
        <section className="px-6 py-10 sm:px-10 sm:py-14" 
         style={{ fontFamily: "Lexend, sans-serif" }}>
        <h2 className="mb-4 font-lexend font-normal text-[32px] 
        leading-[140%] tracking-[0em] text-[#000000]">
  Contact &amp; Support
</h2>
<p
  className="mb-6 max-w-3xl text-[25px] font-light
   leading-[140%] tracking-[0.01em] text-[#000000]"
  style={{ fontFamily: "Lexend, sans-serif" }}
>
  We believe transparency and accessibility are important. Users can contact{" "}
  <span
    className="font-medium underline text-[#000000] tracking-[0.01em]"
    style={{ fontFamily: "Lexend, sans-serif" }}
  >
    HaulHub
  </span>{" "}
  for support, questions, or feedback using the information below:
</p>

<p
  className="mb-6 max-w-3xl text-[25px]  text-[22px] font-normal leading-[27px] tracking-[0.07em] text-[#000000]"
  style={{ fontFamily: "Lexend, sans-serif" }}
>
Email:  <span
  className="text-[22px] font-normal leading-[27px] tracking-[0.07em] underline text-[#000000]"
  style={{ fontFamily: "Lexend, sans-serif" }}
>support@renthaulhub.com </span>Customer Support: Available through the in-app 
support feature
</p>


<ul className="mb-8 flex flex-col gap-3"> 
<li className="flex items-center gap-3 font-light text-[25px] leading-[140%] tracking-[0em] text-[#000000]">
  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#389131]/15 text-[#389131]">
    <ThumbsUp className="h-5 w-5" aria-hidden />
  </span>
  Providing a safe and reliable platform
</li>

<li className="flex items-center gap-3 font-light text-[25px] leading-[140%] tracking-[0em] text-[#000000]">
  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#389131]/15 text-[#389131]">
    <Lock className="h-5 w-5" aria-hidden />
  </span>
  Supporting responsible rentals
</li>

<li className="flex items-center gap-3 font-light text-[25px] leading-[140%] tracking-[0em] text-[#000000]">
  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#389131]/15 text-[#389131]">
    <Check className="h-5 w-5" aria-hidden />
  </span>
  Protecting user information and privacy
</li>

<li className="flex items-center gap-3 font-light text-[25px] leading-[140%] tracking-[0em] text-[#000000]">
  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#389131]/15 text-[#389131]">
    <Check className="h-5 w-5" aria-hidden />
  </span>
  Continuously improving the platform experience
</li>

</ul>
<p className="mb-6 max-w-3xl font-light text-[25px] leading-[120%] tracking-[0.01em] text-[#000000]">
  I want the owner and customer to be able to send the pictures in the app
  and the app hold them until the delivery is complete and the owner confirms
  the trailer is returned back in the condition they sent it and the owner
  will then confirm the deposit is clear to be returned.
</p>
        </section>
      </div>
    </main>
  );
};

export default About;
