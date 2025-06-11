'use client';

const Footer = () => {
  return (
    <footer className="bg-gray-700 text-white p-4 text-center mt-auto">
      <div className="container mx-auto">
        <p>&copy; {new Date().getFullYear()} E-commerce App. All rights reserved.</p>
        {/* Add any other footer content here, like links or social media icons */}
      </div>
    </footer>
  );
};

export default Footer;
