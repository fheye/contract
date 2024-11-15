// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@fhenixprotocol/contracts/access/Permissioned.sol";
import "@fhenixprotocol/contracts/FHE.sol";

contract FaceDetection is Permissioned {
    // constant length of vector
    uint8 constant VECTOR_LENGTH = 128;
    uint8 constant CHUNK_SIZE = 2;

    // Mapping of image to feature vector (encrypted)
    mapping(uint256 => euint8[VECTOR_LENGTH]) public images;

    // Mapping of image to metadata
    mapping(uint256 => Image) public metadata;

    // Mapping of user address to User struct
    mapping(address => User) public users;


    // Counter for generating unique image IDs
    uint256 private imageCounter;

    struct User {
        int256 locationX;
        int256 locationY;
        uint256 alertDistance;
        uint256 uploadedImagesCount;
        uint256 rewards;
    }

    struct Image {
        euint16 locationX;
        euint16 locationY;
        euint16 timestamp;
        address uploader;
    }

    event ImageUploaded(address indexed user, uint256 imageId);
    event MetadataAccessed(uint256 imageId, address accessor, uint256 fee);

    constructor() {
        imageCounter = 0;
    }

    /// @notice Computes the Euclidean distance between an input vector and a stored vector
    /// @param imageId The ID of the stored image to compare
    /// @param inputVector The input encrypted vector to compare against
    /// @return distance The encrypted Euclidean distance score
    function faceDetection(uint256 imageId, inEuint8[VECTOR_LENGTH] memory inputVector) public view returns (uint32 distance) {
        require(imageId < imageCounter, "Invalid image ID");


        euint32 sumOfSquares = FHE.asEuint32(0);

        for (uint256 i = 0; i < VECTOR_LENGTH; i++) {
            euint8 diff = images[imageId][i] - FHE.asEuint8(inputVector[i]);
            euint8 squaredDiff = diff * diff;
            sumOfSquares = sumOfSquares + FHE.asEuint32(squaredDiff);
        }

        // Return the encrypted Euclidean distance score (sum of squared differences)
        return FHE.decrypt(sumOfSquares);
    }


    /// @notice Function to upload an image
    /// @param locationX The X coordinate of the image location
    /// @param locationY The Y coordinate of the image location
    /// @param timestamp The timestamp of the image
    function uploadImage(
        inEuint16 calldata locationX,
        inEuint16 calldata locationY,
        inEuint16 calldata timestamp
    ) public {
        uint256 imageId = imageCounter;

        euint8[128] memory newVector;

        for (uint16 i = 0; i < 128; i++) {
            newVector[i] = FHE.asEuint8(0);
        }

        images[imageId] = newVector;

        metadata[imageId] = Image({
            locationX: FHE.asEuint16(locationX),
            locationY: FHE.asEuint16(locationY),
            timestamp: FHE.asEuint16(timestamp),
            uploader: msg.sender
        });

        users[msg.sender].uploadedImagesCount += 1;

        imageCounter++;

        emit ImageUploaded(msg.sender, imageId);
    }

    function uploadImageChunk(
        inEuint8[] calldata inputVector,
        uint256 imageId,
        uint256 chunkIndex
    ) public {
        require(imageId < imageCounter, "Invalid image ID");

        euint8[CHUNK_SIZE] memory newVector;
        for (uint16 i = 0; i < CHUNK_SIZE; i++) {
            newVector[i] = FHE.asEuint8(inputVector[i]);
        }

        euint8[VECTOR_LENGTH] memory existingVector = images[imageId];
        for (uint16 i = 0; i < CHUNK_SIZE; i++) {
            existingVector[chunkIndex * CHUNK_SIZE + i] = newVector[i];
        }

        images[imageId] = existingVector;
    }

    /// @notice Function to access metadata for an image (payable)
    /// @param imageId The ID of the image
    function accessMetadata(uint256 imageId) public payable returns (uint16, uint16, uint16) {
        require(msg.value >= 0.01 ether, "Insufficient payment");

        Image memory image = metadata[imageId];
        require(image.uploader != address(0), "Image does not exist");

        // Reward the uploader
        users[image.uploader].rewards += msg.value;

        emit MetadataAccessed(imageId, msg.sender, msg.value);
        return (FHE.decrypt(image.locationX), FHE.decrypt(image.locationY), FHE.decrypt(image.timestamp));
    }

    /// @notice Update user location
    /// @param x The X coordinate of the user's location
    /// @param y The Y coordinate of the user's location
    function updateUserLocation(int256 x, int256 y) public {
        users[msg.sender].locationX = x;
        users[msg.sender].locationY = y;
    }
}