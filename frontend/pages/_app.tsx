import type { AppProps } from "next/app";
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700;900&display=swap" rel="stylesheet" />
        <style>{`
          body {
            font-family: 'Tajawal', Arial, sans-serif;
            direction: rtl;
            background: #f7f7fa;
            margin: 0;
            padding: 0;
          }
        `}</style>
      </Head>
      <Component {...pageProps} />
    </>
  );
} 