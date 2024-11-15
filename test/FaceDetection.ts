/* eslint-disable @typescript-eslint/no-unused-vars */
import { expect } from "chai";
import hre, { ethers, fhenixjs } from "hardhat";
import { FaceDetection } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import {
  createPermissionForContract,
  getTokensFromFaucet,
} from "../utils/instance";

describe("FaceDetection", function () {
  let signer: SignerWithAddress;

  let faceDetection: FaceDetection;
  let faceDetectionAddress: string;

  before(async () => {
    signer = (await ethers.getSigners())[0];
    await getTokensFromFaucet(hre, signer.address);

    const faceDetectionFactory = await ethers.getContractFactory("FaceDetection");
    faceDetection = await faceDetectionFactory.deploy();
    await faceDetection.waitForDeployment();
    faceDetectionAddress = await faceDetection.getAddress();
  });

  describe("Deployment", function () {
    it("should add image successfully", async function () {
      const encryptedLocationX = await fhenixjs.encrypt_uint16(0);
      const encryptedLocationY = await fhenixjs.encrypt_uint16(0);
      const encryptedTimestamp = await fhenixjs.encrypt_uint16(0);

      (await faceDetection.connect(signer).uploadImage(encryptedLocationX, encryptedLocationY, encryptedTimestamp)).wait();

      const chunkSize = 4;
      const vectorSize = 8;

      const encryptedVector = await Promise.all(
        Array.from({ length: vectorSize }, async () => {
          return await fhenixjs.encrypt_uint8(0);
        })
      );

      console.log(`Uploading image with encrypted vector: ${encryptedVector}`);

      for (let i = 0; i < vectorSize / chunkSize; i++) {
        const chunk = encryptedVector.slice(i * chunkSize, (i + 1) * chunkSize);
        (await faceDetection.connect(signer).uploadImageChunk(chunk, 0, i)).wait();
        console.log(`Uploaded chunk ${i}`);
      }

      const encryptedRefVector = await Promise.all(
        Array.from({ length: vectorSize }, async () => {
          return await fhenixjs.encrypt_uint8(1);
        })
      );

      console.log(`Running faceDetection(0), targeting contract at: ${faceDetectionAddress}`);
    
      let distance = (await faceDetection.connect(signer).faceDetection(0, encryptedRefVector));
      console.log(`Distance: ${distance}`);

      // expect(distance).to.be.equal(0);
      
    });
  });
});
