import galfarlogo from "../assets/Images/banner_2.jpg";

const Home = () => {
  return (
    <div className="w-full h-screen">
      <img
        src={galfarlogo}
        alt="Galfar Logo"
        className="w-full  object-cover"
      />
      <div className="max-w-sm  ml-10 mt-10 p-4 bg-white rounded-lg shadow-md border border-gray-200">
        <h2 className="text-lg font-semibold mb-4 underline">Quick Links</h2>
        <ul className="space-y-2">
          <li>
            <button className="w-full flex text-left px-3 py-2 justify-between bg-blue-200 hover:bg-blue-300 rounded font-medium cursor-pointer">
              Pending Statements
              <p>10</p>
            </button>
          </li>
          <li>
            <button className="w-full text-left px-3 py-2 justify-between flex bg-green-200 hover:bg-green-300 rounded font-medium cursor-pointer">
              Approved Statements
              <p>10</p>
            </button>
          </li>
          <li>
            <button className="w-full text-left px-3 py-2 bg-gray-100 justify-between flex hover:bg-gray-200 rounded font-medium cursor-pointer">
              All Statements
              <p>10</p>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Home;
