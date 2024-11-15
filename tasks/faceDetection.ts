import { FaceDetection } from "../typechain-types";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";
import {Deployment} from "hardhat-deploy/dist/types";

task("task:faceDetection")
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
      `Running faceDetection(${amountToAdd}), targeting contract at: ${FaceDetection.address}`,
    );

    const contract = await ethers.getContractAt("FaceDetection", FaceDetection.address);
    const vectorSize = 32;

    const encryptedVector = await Promise.all(
      Array.from({ length: vectorSize }, async () => {
        return await fhenixjs.encrypt_uint8(0);
      })
    );

    let contractWithSigner = contract.connect(signer) as unknown as FaceDetection;

    try {
      let distance = await contractWithSigner.faceDetection(0, encryptedVector);
      console.log(`Distance: ${distance}`);
    } catch (e) {
      console.log(`Failed to send upload image transaction: ${e}`);
      return;
    }
  });