import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400&family=Shippori+Mincho:wght@400;500;600&family=Noto+Serif+JP:wght@300;400&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              function googleTranslateElementInit() {
                new google.translate.TranslateElement({
                  pageLanguage: 'en',
                  includedLanguages: 'en,ja',
                  autoDisplay: false
                }, 'google_translate_element');
              }
            `,
          }}
        />
        <script src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" async defer></script>
      </Head>
      <body>
        <div id="google_translate_element" style={{ display: 'none' }}></div>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
