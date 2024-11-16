
# Setting Up a Custom Subgraph with a Custom Graph Node

This guide explains how to create a custom subgraph using a custom graph node for Fhenix. Follow the steps below to configure and deploy effectively.

---

## **Step 1: Setting Up a Custom Graph Node**

1. **Clone the Graph Node Repository**  
   Clone the official Graph Protocol repository:  
   ```bash
   git clone https://github.com/graphprotocol/graph-node
   ```

2. **Configure IPFS for Local Setup**  
   Navigate to the Docker Compose file:  
   `docker/docker-compose.yml`  
   Modify the `services.graph-node.environment.ipfs` setting:  
   ```yaml
   ipfs: 'http://host.docker.internal:5001'
   ```

3. **Configure for a Custom Ethereum Network**  
   In the same Docker Compose file, update the `services.graph-node.environment.ethereum` setting:  
   ```yaml
   ethereum: 'NETWORK_HANDLER:NETWORK_RPC_URL'
   ```

---

## **Step 2: Creating a Custom Subgraph**

1. **Install Graph CLI**  
   Ensure you have the latest version of the Graph CLI:  
   ```bash
   npm install -g @graphprotocol/graph-cli@latest
   ```

2. **Initialize the Subgraph**  
   Run the following command to initialize your subgraph:  
   ```bash
   graph init --network <NETWORK_HANDLER> --from-contract <CONTRACT_ADDRESS> <SUBGRAPH_SLUG>
   ```
   - Select `ethereum` as the protocol when prompted.
   - If fetching the ABI from Etherscan fails:
     1. Manually create a new file named `abi.json`.
     2. Paste the contract's ABI into the file.
     3. Provide the path to `abi.json` when prompted.

3. **Deploy the Subgraph**  
   Use the following deployment command:  
   ```bash
   graph deploy <SUBGRAPH_SLUG> --ipfs http://127.0.0.1:5001/ --node http://127.0.0.1:8020/
   ```
   - If you encounter deployment errors, create the subgraph explicitly first:  
     ```bash
     graph create --node http://127.0.0.1:8020/ <SUBGRAPH_SLUG>
     ```  
     Then retry the deploy command.

---

By following this guide, you can successfully set up and deploy your custom subgraph with a custom graph node tailored for Fhenix.  
