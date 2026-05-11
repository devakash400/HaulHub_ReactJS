import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, Pencil } from "lucide-react";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isStrongPassword = (pwd: string) => {
  const s = pwd;
  return (
    s.length >= 8 &&
    /[A-Z]/.test(s) &&
    /[a-z]/.test(s) &&
    /[0-9]/.test(s) &&
    /[^A-Za-z0-9]/.test(s)
  );
};

const digitsOnly = (v: string) => v.replace(/\D/g, "");

const EditProfile: React.FC = () => {
  const navigate = useNavigate();
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  const [photo, setPhoto] = useState<File | null>(null);
  const [firstName, setFirstName] = useState("demo");
  const [lastName, setLastName] = useState("demo");
  const [email, setEmail] = useState("dem@gmail.com");
  const [password, setPassword] = useState("*****");
  const [phone, setPhone] = useState("*****");
  const [dob, setDob] = useState("2003-12-10");
  const [address, setAddress] = useState("2458 Parkside Avenue");
  const [country, setCountry] = useState("USA");
  const [city, setCity] = useState("New York City");
  const [zip, setZip] = useState("2432");
  const [idNumber, setIdNumber] = useState("34535");
  const [bookTrailer, setBookTrailer] = useState("Flatbed");
  const [checkIn, setCheckIn] = useState("2024-10-12");
  const [checkOut, setCheckOut] = useState("2024-10-20");

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = "Enter first name";
    if (!lastName.trim()) e.lastName = "Enter last name";
    if (!email.trim()) e.email = "Enter email";
    else if (!emailRegex.test(email.trim())) e.email = "Enter a valid Email ID";
    if (!password) e.password = "Enter password";
    else if (!isStrongPassword(password))
      e.password = "Password does not meet requirements";
    const phoneDigits = digitsOnly(phone);
    if (!phoneDigits) e.phone = "Enter phone number";
    else if (phoneDigits.length < 10)
      e.phone = "Enter at least 10 digits number";
    if (!dob) e.dob = "Enter date of birth";
    if (!address.trim()) e.address = "Enter address";
    if (!country.trim()) e.country = "Enter your Country";
    if (!city.trim()) e.city = "Enter your City";
    if (!zip.trim()) e.zip = "Enter zip code";
    else if (digitsOnly(zip).length < 3) e.zip = "Enter a valid zip code";
    if (!idNumber.trim()) e.idNumber = "Enter ID number";
    if (!bookTrailer.trim()) e.bookTrailer = "Select trailer";
    if (!checkIn) e.checkIn = "Select check-in";
    if (!checkOut) e.checkOut = "Select check-out";
    if (checkIn && checkOut && new Date(checkOut) < new Date(checkIn))
      e.checkOut = "Checkout must be after check-in";
    return e;
  }, [
    firstName,
    lastName,
    email,
    password,
    phone,
    dob,
    address,
    country,
    city,
    zip,
    idNumber,
    bookTrailer,
    checkIn,
    checkOut,
  ]);

  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);

  const requirements = useMemo(() => {
    const s = password;
    return {
      len: s.length >= 8,
      upper: /[A-Z]/.test(s),
      lower: /[a-z]/.test(s),
      num: /[0-9]/.test(s),
      special: /[^A-Za-z0-9]/.test(s),
    };
  }, [password]);

  const onNext = () => {
    if (!isValid) return;
    navigate("/", { replace: false });
  };

  return (
    <div className="min-h-screen bg-white w-full min-w-0 overflow-x-hidden">
      <div className="max-w-3xl mx-auto w-full">
        <header className="relative py-5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-gray-100 text-gray-900 inline-flex items-center justify-center"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden />
          </button>
          <h1 className="text-center text-xl font-semibold text-gray-900">
            Edit Profile
          </h1>
        </header>

        <main className="px-4 sm:px-6 pb-10">
          <div className="flex items-center justify-center py-4">
            <div className="relative">
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
              />
              <div className="h-20 w-20 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                {photo ? (
                  <img
                    src={URL.createObjectURL(photo)}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-gray-600">Photo</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="absolute bottom-0 right-0 h-7 w-7 rounded-full bg-[#389131] text-white inline-flex items-center justify-center shadow-sm"
                aria-label="Edit photo"
              >
                <Pencil className="w-4 h-4" aria-hidden />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-800">
                  First Name
                </label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={`mt-1 w-full border rounded-md px-3 py-2.5 text-sm outline-none ${
                    errors.firstName ? "border-red-400" : "border-gray-300"
                  }`}
                />
                {errors.firstName && (
                  <p className="mt-1 text-[11px] text-red-600">
                    {errors.firstName}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800">
                  Last Name
                </label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={`mt-1 w-full border rounded-md px-3 py-2.5 text-sm outline-none ${
                    errors.lastName ? "border-red-400" : "border-gray-300"
                  }`}
                />
                {errors.lastName && (
                  <p className="mt-1 text-[11px] text-red-600">
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800">
                Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`mt-1 w-full border rounded-md px-3 py-2.5 text-sm outline-none ${
                  errors.email ? "border-red-400" : "border-gray-300"
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-[11px] text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`mt-1 w-full border rounded-md px-3 py-2.5 text-sm outline-none ${
                  errors.password ? "border-red-400" : "border-gray-300"
                }`}
              />
              <div className="mt-2 text-[11px] space-y-0.5">
                <p
                  className={`${requirements.len ? "text-green-700" : "text-red-600"}`}
                >
                  - Add at least 8 characters
                </p>
                <p
                  className={`${requirements.upper ? "text-green-700" : "text-red-600"}`}
                >
                  - Uppercase letters (A-Z)
                </p>
                <p
                  className={`${requirements.lower ? "text-green-700" : "text-red-600"}`}
                >
                  - Lowercase letters (a-z)
                </p>
                <p
                  className={`${requirements.num ? "text-green-700" : "text-red-600"}`}
                >
                  - Numbers (0-9)
                </p>
                <p
                  className={`${requirements.special ? "text-green-700" : "text-red-600"}`}
                >
                  - Special characters (e.g. @, #, $, %)
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800">
                Phone Number
              </label>
              <div
                className={`mt-1 w-full border rounded-md px-3 py-2.5 text-sm flex items-center gap-2 ${
                  errors.phone ? "border-red-400" : "border-gray-300"
                }`}
              >
                <span className="text-sm">🇺🇸</span>
                <span className="text-gray-500 text-sm">+1</span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 outline-none"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-[11px] text-red-600">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800">
                Date of birth
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className={`mt-1 w-full border rounded-md px-3 py-2.5 text-sm outline-none ${
                  errors.dob ? "border-red-400" : "border-gray-300"
                }`}
              />
              {errors.dob && (
                <p className="mt-1 text-[11px] text-red-600">{errors.dob}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800">
                Address
              </label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={`mt-1 w-full border rounded-md px-3 py-2.5 text-sm outline-none ${
                  errors.address ? "border-red-400" : "border-gray-300"
                }`}
              />
              {errors.address && (
                <p className="mt-1 text-[11px] text-red-600">
                  {errors.address}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800">
                Country
              </label>
              <div
                className={`mt-1 w-full border rounded-md px-3 py-2.5 text-sm flex items-center justify-between ${
                  errors.country ? "border-red-400" : "border-gray-300"
                }`}
              >
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="flex-1 bg-transparent outline-none appearance-none"
                >
                  <option value="">Select Country</option>
                  <option value="USA">USA</option>
                  <option value="Canada">Canada</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-600" aria-hidden />
              </div>
              {errors.country && (
                <p className="mt-1 text-[11px] text-red-600">
                  {errors.country}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800">
                City
              </label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={`mt-1 w-full border rounded-md px-3 py-2.5 text-sm outline-none ${
                  errors.city ? "border-red-400" : "border-gray-300"
                }`}
              />
              {errors.city && (
                <p className="mt-1 text-[11px] text-red-600">{errors.city}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800">
                Zip Code
              </label>
              <input
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                className={`mt-1 w-full border rounded-md px-3 py-2.5 text-sm outline-none ${
                  errors.zip ? "border-red-400" : "border-gray-300"
                }`}
              />
              {errors.zip && (
                <p className="mt-1 text-[11px] text-red-600">{errors.zip}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800">
                ID Number
              </label>
              <input
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                className={`mt-1 w-full border rounded-md px-3 py-2.5 text-sm outline-none ${
                  errors.idNumber ? "border-red-400" : "border-gray-300"
                }`}
              />
              {errors.idNumber && (
                <p className="mt-1 text-[11px] text-red-600">
                  {errors.idNumber}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800">
                Book Trailer
              </label>
              <div
                className={`mt-1 w-full border rounded-md px-3 py-2.5 text-sm flex items-center justify-between ${
                  errors.bookTrailer ? "border-red-400" : "border-gray-300"
                }`}
              >
                <select
                  value={bookTrailer}
                  onChange={(e) => setBookTrailer(e.target.value)}
                  className="flex-1 bg-transparent outline-none appearance-none"
                >
                  <option value="">Select Trailer</option>
                  <option value="Flatbed">Flatbed</option>
                  <option value="Gooseneck">Gooseneck</option>
                  <option value="Enclosed">Enclosed</option>
                </select>
                <ChevronDown className="w-4 h-4 text-gray-600" aria-hidden />
              </div>
              {errors.bookTrailer && (
                <p className="mt-1 text-[11px] text-red-600">
                  {errors.bookTrailer}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-800">
                  CheckDate
                </label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className={`mt-1 w-full border rounded-md px-3 py-2.5 text-sm outline-none ${
                    errors.checkIn ? "border-red-400" : "border-gray-300"
                  }`}
                />
                {errors.checkIn && (
                  <p className="mt-1 text-[11px] text-red-600">
                    {errors.checkIn}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800">
                  Check out
                </label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className={`mt-1 w-full border rounded-md px-3 py-2.5 text-sm outline-none ${
                    errors.checkOut ? "border-red-400" : "border-gray-300"
                  }`}
                />
                {errors.checkOut && (
                  <p className="mt-1 text-[11px] text-red-600">
                    {errors.checkOut}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full border border-gray-300 bg-white text-gray-900 py-3 rounded-md text-sm font-semibold hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={!isValid}
              aria-disabled={!isValid}
              className={`w-full py-3 rounded-md text-sm font-semibold transition-opacity text-white`}
              style={{
                backgroundColor: !isValid ? "#929191" : "#389131",
                cursor: !isValid ? "not-allowed" : "pointer",
              }}
            >
              Next
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EditProfile;
