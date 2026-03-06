import React from "react";

type PlaceholderProps = {
  title: string;
};

const Placeholder: React.FC<PlaceholderProps> = ({ title }) => {
  return (
    <main className="min-h-[50vh] p-8 font-sans text-[#389131] w-full min-w-0 overflow-x-hidden">
      <h1>{title}</h1>
      <p>Coming soon.</p>
    </main>
  );
};

export default Placeholder;
