import React from 'react'
const PURPLE = "#2E1C8D";
const NAVY = "#16115A";

const Avatar = ({ name, size = 36 }) =>  {
  const initials = (name || "?")
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

  return (
    <div
      className="flex shrink-0 items-center uppercase justify-center rounded-full font-semibold text-white ring-2 ring-white shadow-sm"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: `linear-gradient(135deg, ${PURPLE}, ${NAVY})`,
      }}
    >
      {initials || "?"}
    </div>
  );
}

export default Avatar
