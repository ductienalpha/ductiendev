import "./globals.css";

export const metadata = {
  title: "Lupophobia Dashboard",
  description: "Dashboard for Lupophobia Extension on Wolvesville",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="aurora">
          <div className="blob b1"></div>
          <div className="blob b2"></div>
          <div className="blob b3"></div>
        </div>
        {children}
      </body>
    </html>
  );
}
