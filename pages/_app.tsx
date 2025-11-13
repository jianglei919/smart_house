/*
 * @Author: smartHome
 * @Date: 2025-11-15 21:32:52
 * @LastEditors: smartHome
 * @LastEditTime: 2025-11-15 21:32:53
 * @Description:
 */
import GlobalStyle from "@/src/styled/GlobalStyle";
import ThemeProvider from "@/src/styled/ThemeProvide";
import type { AppProps } from "next/app";

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <ThemeProvider>
            <GlobalStyle />
            <Component {...pageProps} />
        </ThemeProvider>
    );
}

export default MyApp;
