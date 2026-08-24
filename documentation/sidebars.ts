import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";
import marketsApiSidebar from "../docs/technical/api-reference/sidebar";

const sidebars: SidebarsConfig = {
  documentationSidebar: [
    {
      type: "category",
      label: "Application surfaces",
      link: { type: "doc", id: "surfaces/index" },
      items: [
        {
          type: "category",
          label: "Assets",
          link: { type: "doc", id: "surfaces/assets/index" },
          items: [
            {
              type: "category",
              label: "Reference Data",
              link: { type: "doc", id: "surfaces/assets/reference-data/index" },
              items: [
                "surfaces/assets/reference-data/asset-categories",
                "surfaces/assets/reference-data/master-list",
                "surfaces/assets/reference-data/indices",
              ],
            },
          ],
        },
        {
          type: "category",
          label: "Portfolios",
          link: { type: "doc", id: "surfaces/portfolios/index" },
          items: [
            {
              type: "category",
              label: "Portfolio Management",
              link: { type: "doc", id: "surfaces/portfolios/portfolio-management/index" },
              items: [
                "surfaces/portfolios/portfolio-management/portfolios",
                "surfaces/portfolios/portfolio-management/portfolio-groups",
                "surfaces/portfolios/portfolio-management/signals",
              ],
            },
          ],
        },
        {
          type: "category",
          label: "Managed Accounts",
          link: { type: "doc", id: "surfaces/managed-accounts/index" },
          items: [
            {
              type: "category",
              label: "Account Management",
              link: { type: "doc", id: "surfaces/managed-accounts/account-management/index" },
              items: [
                "surfaces/managed-accounts/account-management/accounts",
                "surfaces/managed-accounts/account-management/virtual-funds",
              ],
            },
          ],
        },
        {
          type: "category",
          label: "Pricing",
          link: { type: "doc", id: "surfaces/pricing/index" },
          items: [
            {
              type: "category",
              label: "Pricing Data",
              link: { type: "doc", id: "surfaces/pricing/pricing-data/index" },
              items: [
                "surfaces/pricing/pricing-data/curves",
                "surfaces/pricing/pricing-data/market-data",
              ],
            },
          ],
        },
        {
          type: "category",
          label: "Platform",
          link: { type: "doc", id: "surfaces/platform/index" },
          items: [
            {
              type: "category",
              label: "Platform Tools",
              link: { type: "doc", id: "surfaces/platform/platform-tools/index" },
              items: [
                "surfaces/platform/platform-tools/calendars",
                "surfaces/platform/platform-tools/api-diagnostics",
              ],
            },
          ],
        },
      ],
    },
    {
      type: "category",
      label: "Technical documentation",
      link: { type: "doc", id: "technical/index" },
      items: [
        "technical/architecture",
        "technical/local-development",
        "technical/api-contract",
        {
          type: "category",
          label: "API reference",
          link: { type: "doc", id: "technical/api-reference" },
          items: marketsApiSidebar,
        },
        "technical/route-compatibility",
        "technical/embedding-security",
        "technical/deployment-and-rollback",
        "technical/changelog",
        {
          type: "category",
          label: "Implementation tasks",
          items: [
            "technical/implementation-tasks/mainsequence_markets_site_refactor",
            "technical/implementation-tasks/command_center_sdk_normalization",
            "technical/implementation-tasks/command_center_sdk_0_1_3_alignment",
          ],
        },
      ],
    },
  ],
};

export default sidebars;
