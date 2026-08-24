import type { Config } from "@docusaurus/types";
import type { Options, ThemeConfig } from "@docusaurus/preset-classic";
import type * as OpenApiPlugin from "docusaurus-plugin-openapi-docs";
import { themes as prismThemes } from "prism-react-renderer";

const config: Config = {
  title: "Main Sequence Markets Documentation",
  tagline: "Application surfaces and technical reference",
  url: "https://5922b2cd-91f6-4271-a16a-f3f8fb8227e8.site-dev.main-sequence.app",
  baseUrl: "/docs/",
  trailingSlash: true,
  onBrokenLinks: "throw",
  presets: [
    [
      "classic",
      {
        blog: false,
        docs: {
          docItemComponent: "@theme/ApiItem",
          exclude: ["SUMMARY.md"],
          path: "../docs",
          routeBasePath: "/",
          sidebarPath: "./sidebars.ts",
        },
        theme: {},
      } satisfies Options,
    ],
  ],
  plugins: [
    [
      "docusaurus-plugin-openapi-docs",
      {
        id: "markets-api",
        docsPluginId: "classic",
        config: {
          markets: {
            specPath: "../docs/technical/contracts/mainsequencemarkets-openapi.json",
            outputDir: "../docs/technical/api-reference",
            hideSendButton: true,
            showInfoPage: false,
            showSchemas: true,
            sidebarOptions: {
              groupPathsBy: "tagGroup",
              categoryLinkSource: "tag",
              sidebarCollapsible: true,
              sidebarCollapsed: true,
            },
          } satisfies OpenApiPlugin.Options,
        },
      },
    ],
  ],
  themes: ["docusaurus-theme-openapi-docs"],
  themeConfig: {
    colorMode: {
      defaultMode: "dark",
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: "Main Sequence Markets",
      items: [
        {
          type: "docSidebar",
          sidebarId: "documentationSidebar",
          position: "left",
          label: "Documentation",
        },
        {
          type: "html",
          position: "right",
          value: '<a class="navbar__link menu__link" href="/">Back to Markets</a>',
        },
      ],
    },
    footer: {
      style: "dark",
      copyright: `Main Sequence Markets · ${new Date().getFullYear()}`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies ThemeConfig,
};

export default config;
