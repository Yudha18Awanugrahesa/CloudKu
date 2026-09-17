import "../styles/globals.css";
import { AuthProvider } from "../context/AuthContext";
import Head from "next/head";

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <title>CloudTrack - Personal Finance App</title>
      </Head>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
