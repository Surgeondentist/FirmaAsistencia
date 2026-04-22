import Script from "next/script";

const DEFAULT_GA_ID = "G-83MBFMV0X8";

function measurementId(): string | null {
  const raw = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  if (raw === "" || raw === "false") return null;
  return raw || DEFAULT_GA_ID;
}

/** Google Analytics 4 (gtag). ID por defecto del proyecto; anula con `NEXT_PUBLIC_GA_MEASUREMENT_ID`. */
export function GoogleAnalytics() {
  const id = measurementId();
  if (!id) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics-gtag" strategy="afterInteractive">
        {`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', ${JSON.stringify(id)});
`}
      </Script>
    </>
  );
}
