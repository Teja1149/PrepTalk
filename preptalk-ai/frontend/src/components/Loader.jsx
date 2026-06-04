const Loader = ({ text = "Loading..." }) => {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span className="text-gray-600">{text}</span>
      </div>
    </div>
  );
};

export default Loader;
