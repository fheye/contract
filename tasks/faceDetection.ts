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
    const vectorSize = 4;
    const chunkSize = 4;

    const encryptedVector = await Promise.all(
      Array.from({ length: vectorSize }, async () => {
        return await fhenixjs.encrypt_uint8(1);
      })
    );

    let contractWithSigner = contract.connect(signer) as unknown as FaceDetection;

    let totalDistance = BigInt(0);

    for (let i = 0; i < vectorSize / chunkSize; i++) {
      const chunk = encryptedVector.slice(i * chunkSize, (i + 1) * chunkSize);

      const distance = await contractWithSigner.faceDetectionChunk(0, chunk, i);
    }

    console.log(`Total distance: ${totalDistance.toString()}`);
  });