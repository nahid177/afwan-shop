import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '@/mode/ThemeContext'; // Import useTheme hook

const Footer: React.FC = () => {
  const { theme } = useTheme(); // Get theme from context

  // Conditionally setting the logo source based on the theme
  const logoSrc = theme === "light"
    ? "https://afwanimage.s3.us-east-1.amazonaws.com/afwan+svg-01(1).svg"
    : "https://afwanimage.s3.us-east-1.amazonaws.com/afwan+svg-02.svg";

  return (
    <footer className={`${theme === "light" ? "bg-slate-300 text-black" : "bg-gray-800 text-white"}`}>
      <div className="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8">
        <div className="md:flex md:justify-between">
          <div className="mb-6 md:mb-0">
            <Link href="https://flowbite.com/" passHref>
              <div className="flex items-center">
                <Image
                  src={logoSrc}
                  alt="Logo"
                  className="h-28 me-12"
                  width={200} // Set width for the image
                  height={200} // Set height for the image
                />
               
              </div>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3">
            <div>
              <h2 className={`mb-6 text-sm font-semibold ${theme === "light" ? "text-gray-900" : "text-white"} uppercase`}>
                Resources
              </h2>
              <ul className={`text-gray-500 ${theme === "light" ? "dark:text-gray-400" : "text-gray-400"} font-medium`}>
                <li className="mb-4">
                  <Link href="https://flowbite.com/" passHref>
                    <div className="hover:underline">Flowbite</div>
                  </Link>
                </li>
                <li>
                  <Link href="https://tailwindcss.com/" passHref>
                    <div className="hover:underline">Tailwind CSS</div>
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h2 className={`mb-6 text-sm font-semibold ${theme === "light" ? "text-gray-900" : "text-white"} uppercase`}>
                Follow us
              </h2>
              <ul className={`text-gray-500 ${theme === "light" ? "dark:text-gray-400" : "text-gray-400"} font-medium`}>
                <li className="mb-4">
                  <Link href="https://github.com/themesberg/flowbite" passHref>
                    <div className="hover:underline">Github</div>
                  </Link>
                </li>
                <li>
                  <Link href="https://discord.gg/4eeurUVvTy" passHref>
                    <div className="hover:underline">Discord</div>
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h2 className={`mb-6 text-sm font-semibold ${theme === "light" ? "text-gray-900" : "text-white"} uppercase`}>
                Legal
              </h2>
              <ul className={`text-gray-500 ${theme === "light" ? "dark:text-gray-400" : "text-gray-400"} font-medium`}>
                <li className="mb-4">
                  <Link href="#" passHref>
                    <div className="hover:underline">Privacy Policy</div>
                  </Link>
                </li>
                <li>
                  <Link href="#" passHref>
                    <div className="hover:underline">Terms & Conditions</div>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <hr className={`my-6 border-gray-200 sm:mx-auto ${theme === "light" ? "dark:border-gray-700" : "border-gray-700"} lg:my-8`} />
        <div className="sm:flex sm:items-center sm:justify-between">
          <span className={ ` mb-9 flex text-sm ${theme === "light" ? "text-gray-500" : "text-gray-400"} sm:text-center`}>
            © 2024{' '} 
            <Link href="https://flowbite.com/" passHref>
              <div className="hover:underline">  Afwan™ </div>
            </Link>
            . All Rights Reserved.
          </span>
          <div className="flex mt-4 sm:justify-center sm:mt-0">
            <Link href="#" passHref>
              <div className={`text-gray-500 hover:text-gray-900 ${theme === "light" ? "dark:hover:text-white" : "text-white"} transition duration-200`}>
                <svg
                  className="w-4 h-4"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 8 19"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.135 3H8V0H6.135a4.147 4.147 0 0 0-4.142 4.142V6H0v3h2v9.938h3V9h2.021l.592-3H5V3.591A.6.6 0 0 1 5.592 3h.543Z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="sr-only">Facebook page</span>
              </div>
            </Link>
            <Link href="#" passHref>
              <div className={`text-gray-500 hover:text-gray-900 ${theme === "light" ? "dark:hover:text-white" : "text-white"} ms-5 transition duration-200`}>
                <svg
                  className="w-4 h-4"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 21 16"
                >
                  <path
                    d="M16.942 1.556a16.3 16.3 0 0 0-4.126-1.3 12.04 12.04 0 0 0-.529 1.1 15.175 15.175 0 0 0-4.573 0 11.585 11.585 0 0 0-.535-1.1 16.274 16.274 0 0 0-4.129 1.3A17.392 17.392 0 0 0 .182 13.218a15.785 15.785 0 0 0 4.963 2.521c.41-.564.773-1.16 1.084-1.785a10.63 10.63 0 0 1-1.706-.83c.143-.106.283-.217.418-.33a11.664 11.664 0 0 0 10.118 0c.137.113.277.224.418.33-.544.328-1.116.606-1.71.832a12.52 12.52 0 0 0 1.084 1.785 16.46 16.46 0 0 0 5.064-2.595 17.286 17.286 0 0 0-2.973-11.59ZM6.678 10.813a1.941 1.941 0 0 1-1.8-2.045 1.93 1.93 0 0 1 1.8-2.047 1.919 1.919 0 0 1 1.8 2.047 1.93 1.93 0 0 1-1.8 2.045Zm6.644 0a1.94 1.94 0 0 1-1.8-2.045 1.93 1.93 0 0 1 1.8-2.047 1.918 1.918 0 0 1 1.8 2.047 1.93 1.93 0 0 1-1.8 2.045Z"
                  />
                </svg>
                <span className="sr-only">Discord community</span>
              </div>
            </Link>
            <Link href="#" passHref>
              <div className={`text-gray-500 hover:text-gray-900 ${theme === "light" ? "dark:hover:text-white" : "text-white"} ms-5 transition duration-200`}>
                <svg
                  className="w-4 h-4"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 17"
                >
                  <path
                    fillRule="evenodd"
                    d="M20 1.892a8.178 8.178 0 0 1-2.355.635 4.074 4.074 0 0 0 1.02-2.532 8.283 8.283 0 0 1-2.64.978A4.085 4.085 0 0 0 19.447.26c-1.527 0-2.92.714-3.88 1.804A4.153 4.153 0 0 0 1.5 4.71a11.517 11.517 0 0 0 8.303 4.21A4.142 4.142 0 0 1 4.16 7.77a4.14 4.14 0 0 1 3.738-2.76c-.16-.042-.322-.073-.484-.102a8.462 8.462 0 0 0 3.137-.288 4.071 4.071 0 0 1 2.057 1.547 4.144 4.144 0 0 0 1.216-3.866 8.372 8.372 0 0 1 3.178-1.617A8.49 8.49 0 0 0 20 1.892Z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="sr-only">Twitter page</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
