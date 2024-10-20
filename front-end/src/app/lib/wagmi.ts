import { http, createConfig } from "wagmi";
import { mainnet } from "wagmi/chains";

export const iliad = {
  id: 1513, // Your custom chain ID
  name: "Story Network Testnet",
  nativeCurrency: {
    name: "Testnet IP",
    symbol: "IP",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["https://testnet.storyrpc.io"] },
  },
  blockExplorers: {
    default: { name: "Blockscout", url: "https://testnet.storyscan.xyz" },
  },
  testnet: true,
} as const satisfies Chain;

export const config = createConfig({
  chains: [iliad],
  multiInjectedProviderDiscovery: false,
  transports: {
    [iliad.id]: http(),
  },
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
