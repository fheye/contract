import { FaceDetection } from "../typechain-types";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";
import {Deployment} from "hardhat-deploy/dist/types";

task("task:accessMetadata")
  .addParam("amount", "Amount to add to the counter (plaintext number)", "1")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { fhenixjs, ethers, deployments } = hre;
    const [signer] = await ethers.getSigners();

    let balance = await ethers.provider.getBalance(signer.address);
    console.log(`Balance: ${balance.toString()}`);

    if (balance.toString() === "0") {
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
      `Running accessMetadata(${amountToAdd}), targeting contract at: ${FaceDetection.address}`,
    );

    const contract = await ethers.getContractAt("FaceDetection", FaceDetection.address);

    const vectorSize = 4;
    const chunkSize = 4;

    // const encryptedAmount = await fhenixjs.encrypt_uint32(amountToAdd);
    const encryptedVector = await Promise.all(
      Array.from({ length: vectorSize }, async () => {
        return await fhenixjs.encrypt_uint8(0);
      })
    );

    let contractWithSigner = contract.connect(signer) as unknown as FaceDetection;

    await contractWithSigner.accessMetadata(0).then(async (tx) => {
      console.log(`Transaction hash: ${tx.hash}`);
      console.log(`Waiting for transaction to be mined...`);
      await tx.wait();
    }); 
  });