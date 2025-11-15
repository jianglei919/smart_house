/*
 * @Author: smartHome
 * @Date: 2025-11-07 13:57:36
 * @LastEditors: smartHome
 * @LastEditTime: 2025-11-12 11:01:46
 * @Description:Next的head
 */

import { NextSeo } from "next-seo";
import Head from "next/head";

export const NextSEO = ({ title, desc }: Partial<Record<string, string>>) => {
    return (
        <>
            <NextSeo
                title={title || "智慧家居数字系统"}
                description={
                    desc ||
                    "技术选型:Next.js(React) + TypeScript + Three + CSS-In-JS"
                }
            ></NextSeo>
            <Head>
                <link
                    rel="icon"
                    type="image.svg+sml"
                    href="/logo.png"
                ></link>
            </Head>
        </>
    );
};
