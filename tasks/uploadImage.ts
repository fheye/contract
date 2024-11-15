import { FaceDetection } from "../typechain-types";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";
import {Deployment} from "hardhat-deploy/dist/types";

task("task:uploadImage")
  .addParam("amount", "Amount to add to the counter (plaintext number)", "1")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { fhenixjs, ethers, deployments } = hre;
    const [signer] = await ethers.getSigners();

    if ((await ethers.provider.getBalance(signer.address)).toString() === "0") {
      await fhenixjs.getFunds(signer.address);
    }

    const amountToAdd = Number(taskArguments.amount);
    let FaceDetection: Deployment;
    try {
      FaceDetection = await deployments.get("FaceDetection");
    } catch (e) {
      console.log(`${e}`);
      if (hre.network.name === "hardhat") {
        console.log("You're running on Hardhat network, which is ephemeral. Contracts you deployed with deploy scripts are not available.")
        console.log("Either run the local node with npx hardhat node and use --localhost on tasks, or write tasks that deploy the contracts themselves")
      }
      return;
    }

    console.log(
      `Running uploadImage(${amountToAdd}), targeting contract at: ${FaceDetection.address}`,
    );

    const contract = await ethers.getContractAt("FaceDetection", FaceDetection.address);

    // const encryptedAmount = await fhenixjs.encrypt_uint32(amountToAdd);
    const encryptedVector = await Promise.all(
      Array.from({ length: 128 }, async () => {
        return await fhenixjs.encrypt_uint8(0);
      })
    );

    const encryptedLocationX = await fhenixjs.encrypt_uint16(0);
    const encryptedLocationY = await fhenixjs.encrypt_uint16(0);
    const encryptedTimestamp = await fhenixjs.encrypt_uint16(0);

    let contractWithSigner = contract.connect(signer) as unknown as FaceDetection;

    const chunkSize = 2;

    try {
      await contractWithSigner.uploadImage(encryptedLocationX, encryptedLocationY, encryptedTimestamp);
    } catch (e) {
      console.log(`Failed to send upload image transaction: ${e}`);
      return;
    }

    for (let i = 0; i < 128 / 2; i++) {
      const chunk = encryptedVector.slice(i * chunkSize, (i + 1) * chunkSize);
      await contractWithSigner.uploadImageChunk(chunk, 0, i);
      console.log(`Uploaded chunk ${i}`);
    }
  });