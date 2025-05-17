import { defineConfig } from "vocs";

export default defineConfig({
  theme: {
    accentColor: "#ff0000",
  },
  title: "UX Scout",
  iconUrl: "/icon.png",
  logoUrl: "/logo.png",
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
            text: "Ekubo",
            link: "/examples/apps/ekubo",
          },
          {
            text: "Uniswap",
            link: "/examples/apps/uniswap",
          },
          {
            text: "revoke.cash",
            link: "/examples/apps/revoke-cash",
          },
        ],
      },
    ],
  },
});
