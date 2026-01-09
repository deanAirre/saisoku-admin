import logo from "../../assets/logo-gabadak-transparent.png";

const MaintenancePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        {/* Logo */}
        <div className="mb-8">
          <img src={logo} alt="Sa'isoku" className="w-48 mx-auto" />
        </div>

        {/* Message */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
          Sorry! Not your fault, we will fix this
        </h1>

        <p className="text-gray-600 text-sm md:text-base mb-8">
          We're working on something amazing. Please check back soon.
        </p>

        {/* Optional: Back to Home Button */}
        <a
          href="/admin"
          className="inline-block px-6 py-3 bg-[#0ABAB5] text-white rounded-lg hover:bg-[#099490] transition font-semibold"
        >
          Back to Home
        </a>
      </div>
    </div>
  );
};

export default MaintenancePage;
