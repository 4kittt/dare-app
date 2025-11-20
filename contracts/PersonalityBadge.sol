// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title PersonalityBadge
 * @dev ERC-721 token contract for DareUp personality badges on Base
 * Each personality type becomes a unique NFT badge
 */
contract PersonalityBadge is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    // Personality types mapped to their metadata URIs
    mapping(string => string) private _personalityURIs;

    struct PersonalityData {
        string personalityType;
        int8 visionScore;   // -10 to +10
        int8 riskScore;     // -10 to +10
        int8 styleScore;    // -10 to +10
        int8 actionScore;   // -10 to +10
        string track;       // "Build", "Connect", or "Date"
        uint256 mintedAt;
        string fid;
        string username;
    }

    // Token ID => Personality data
    mapping(uint256 => PersonalityData) public personalityData;

    // FID => has minted (one badge per user)
    mapping(string => bool) public hasMinted;

    // Events
    event PersonalityBadgeMinted(
        address indexed to,
        uint256 indexed tokenId,
        string personalityType,
        string fid,
        string username
    );

    constructor() ERC721("DareUp Personality Badge", "DARE") {}

    /**
     * @dev Mint a new personality badge
     * @param to Address to mint the badge to
     * @param personalityType The personality type (e.g., "Visionary Builder")
     * @param visionScore Vision score (-10 to +10)
     * @param riskScore Risk score (-10 to +10)
     * @param styleScore Style score (-10 to +10)
     * @param actionScore Action score (-10 to +10)
     * @param track User's track preference
     * @param fid Farcaster ID
     * @param username Farcaster username
     * @return tokenId The ID of the minted token
     */
    function mintBadge(
        address to,
        string memory personalityType,
        int8 visionScore,
        int8 riskScore,
        int8 styleScore,
        int8 actionScore,
        string memory track,
        string memory fid,
        string memory username
    ) external returns (uint256) {
        require(bytes(personalityType).length > 0, "Personality type required");
        require(!hasMinted[fid], "User already has a personality badge");
        require(to != address(0), "Cannot mint to zero address");

        // Validate score ranges
        require(visionScore >= -10 && visionScore <= 10, "Vision score out of range");
        require(riskScore >= -10 && riskScore <= 10, "Risk score out of range");
        require(styleScore >= -10 && styleScore <= 10, "Style score out of range");
        require(actionScore >= -10 && actionScore <= 10, "Action score out of range");

        // Validate track
        require(
            keccak256(abi.encodePacked(track)) == keccak256(abi.encodePacked("Build")) ||
            keccak256(abi.encodePacked(track)) == keccak256(abi.encodePacked("Connect")) ||
            keccak256(abi.encodePacked(track)) == keccak256(abi.encodePacked("Date")),
            "Invalid track"
        );

        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();

        _safeMint(to, tokenId);

        personalityData[tokenId] = PersonalityData({
            personalityType: personalityType,
            visionScore: visionScore,
            riskScore: riskScore,
            styleScore: styleScore,
            actionScore: actionScore,
            track: track,
            mintedAt: block.timestamp,
            fid: fid,
            username: username
        });

        hasMinted[fid] = true;

        // Set token URI based on personality type (will be updated separately)
        _setTokenURI(tokenId, "");

        emit PersonalityBadgeMinted(to, tokenId, personalityType, fid, username);

        return tokenId;
    }

    /**
     * @dev Set the URI for a personality type
     * @param personalityType The personality type
     * @param uri The metadata URI
     */
    function setPersonalityURI(string memory personalityType, string memory uri) external onlyOwner {
        _personalityURIs[personalityType] = uri;
    }

    /**
     * @dev Update token URI after minting (called after setting personality URIs)
     * @param tokenId The token ID to update
     */
    function updateTokenURI(uint256 tokenId) external {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        PersonalityData memory data = personalityData[tokenId];
        string memory uri = _personalityURIs[data.personalityType];
        require(bytes(uri).length > 0, "URI not set for personality type");
        _setTokenURI(tokenId, uri);
    }

    /**
     * @dev Get personality data for a token
     * @param tokenId The token ID
     * @return Personality data struct
     */
    function getPersonalityData(uint256 tokenId) external view returns (PersonalityData memory) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return personalityData[tokenId];
    }

    /**
     * @dev Get total supply of minted badges
     * @return Total supply
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter.current();
    }

    /**
     * @dev Check if a user has minted
     * @param fid Farcaster ID to check
     * @return Whether the user has minted
     */
    function userHasMinted(string memory fid) external view returns (bool) {
        return hasMinted[fid];
    }

    // Override functions required by ERC721URIStorage and ERC721
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
