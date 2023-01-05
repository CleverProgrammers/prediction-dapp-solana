import { useEffect, useMemo, useState } from "react";
import "../styles/globals.css";
function MyApp({ Component, pageProps }) {
  return (
    <Component {...pageProps} />
  );
}

export default MyApp;
