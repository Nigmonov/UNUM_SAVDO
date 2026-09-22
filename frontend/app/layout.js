import "./globals.css";
import Script from "next/script";

export const metadata = {
  title: "UNUM SAVDO",
  description: "Do'koningiz doimo nazoratingizda",
};

export default function RootLayout({ children }) {
  return (
    <html lang="uz">
      <body>
        {children}

        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}