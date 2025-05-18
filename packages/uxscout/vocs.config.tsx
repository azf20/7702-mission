import { defineConfig } from "vocs";

export default defineConfig({
  theme: {
    accentColor: "#ff0000",
  },
  title: "UX Scout",
  iconUrl: "/icon.png",
  logoUrl: "/logo.png",
  ogImageUrl:
    "https://vocs.dev/api/og?logo=%logo&title=%title&description=%description",
  head: (
    <script
      defer
      data-domain="uxscout.xyz"
      src="https://plausible.io/js/script.js"
    ></script>
  ),
  socials: [
    {
      icon: "github",
      link: "https://github.com/azf20/7702-mission",
    },
    {
      icon: "x",
      link: "https://x.com/azacharyf",
    },
  ],
  editLink: {
    pattern:
      "https://github.com/azf20/7702-mission/edit/main/packages/uxscout/docs/pages/:path",
    text: "Edit on GitHub",
  },
  sidebar: {
    "/": [
      {
        text: "Home",
        link: "/",
      },
      {
        text: "EIP-7702",
        collapsed: false,
        items: [
          {
            text: "Overview",
            link: "/eip-7702/overview",
          },
          {
            text: "Chains",
            link: "/eip-7702/chains",
          },
          {
            text: "Infrastructure",
            link: "/eip-7702/infrastructure",
          },
          {
            text: "Wallets",
            link: "/eip-7702/wallets",
          },
          {
            text: "Apps",
            link: "/eip-7702/apps",
          },
          {
            text: "Analytics",
            link: "/eip-7702/analytics",
          },
          {
            text: "Resources",
            link: "/eip-7702/resources",
          },
        ],
      },
      {
        text: "Examples",
        link: "/examples",
      },
    ],
    "/examples": [
      {
        text: "Home",
        link: "/",
      },
      {
        text: "EIP-7702",
        link: "/eip-7702/overview",
      },
      {
        text: "Examples",
        link: "/examples",
      },
      {
        text: "Apps",
        collapsed: false,
        items: [
          {
            text: "revoke.cash",
            link: "/examples/apps/revoke-cash",
          },
          {
            text: "Ekubo",
            link: "/examples/apps/ekubo",
          },
          {
            text: "Uniswap",
            link: "/examples/apps/uniswap",
          },
        ],
      },
    ],
  },
});
