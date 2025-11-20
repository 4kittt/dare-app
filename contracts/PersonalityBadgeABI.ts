// ABI for the PersonalityBadge smart contract
export const PERSONALITY_BADGE_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "personalityType",
        "type": "string"
      },
      {
        "internalType": "int8",
        "name": "visionScore",
        "type": "int8"
      },
      {
        "internalType": "int8",
        "name": "riskScore",
        "type": "int8"
      },
      {
        "internalType": "int8",
        "name": "styleScore",
        "type": "int8"
      },
      {
        "internalType": "int8",
        "name": "actionScore",
        "type": "int8"
      },
      {
        "internalType": "string",
        "name": "track",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "fid",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "username",
        "type": "string"
      }
    ],
    "name": "mintBadge",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "getPersonalityData",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "personalityType",
            "type": "string"
          },
          {
            "internalType": "int8",
            "name": "visionScore",
            "type": "int8"
          },
          {
            "internalType": "int8",
            "name": "riskScore",
            "type": "int8"
          },
          {
            "internalType": "int8",
            "name": "styleScore",
            "type": "int8"
          },
          {
            "internalType": "int8",
            "name": "actionScore",
            "type": "int8"
          },
          {
            "internalType": "string",
            "name": "track",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "mintedAt",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "fid",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "username",
            "type": "string"
          }
        ],
        "internalType": "struct PersonalityBadge.PersonalityData",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "fid",
        "type": "string"
      }
    ],
    "name": "userHasMinted",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "personalityType",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "fid",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "username",
        "type": "string"
      }
    ],
    "name": "PersonalityBadgeMinted",
    "type": "event"
  }
] as const;

// Base Sepolia testnet contract address (to be deployed)
export const PERSONALITY_BADGE_CONTRACT_ADDRESS = "0x1234567890123456789012345678901234567890"; // Placeholder - to be updated after deployment

// Contract metadata
export const CONTRACT_METADATA = {
  name: "DareUp Personality Badge",
  symbol: "DARE",
  description: "Personality NFTs for DareUp - connecting compatible crypto creators"
};
