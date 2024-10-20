import { EndpointId } from '@layerzerolabs/lz-definitions'

import type { OAppOmniGraphHardhat, OmniPointHardhat } from '@layerzerolabs/toolbox-hardhat'

const storyContract: OmniPointHardhat = {
    eid: EndpointId.STORY_TESTNET,
    contractName: 'MyOApp',
}

const amoyContract: OmniPointHardhat = {
    eid: EndpointId.AMOY_V2_TESTNET,
    contractName: 'MyOApp',
}

const config: OAppOmniGraphHardhat = {
    contracts: [
        
        {
            contract: storyContract,
        },
        {
            contract: amoyContract,
        },
    ],
    connections: [
        {
            from: storyContract,
            to: amoyContract,
        },
        {
            from: amoyContract,
            to: storyContract,
        },
    ],
}

export default config
