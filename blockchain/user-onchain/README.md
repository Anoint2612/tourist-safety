
# User Onchain Blockchain Module

This folder contains the blockchain integration for the Tourist Safety project using Hardhat and ethers.js.

## Prerequisites
- Node.js (v16 or later recommended)
- npm
- MongoDB instance (local or remote)

## Setup Instructions

1. **Install dependencies**
	```sh
	npm install
	```

2. **Configure environment variables**
   
	Create a `.env` file in this directory with the following variables:
	```env
	RPC_URL=http://localhost:8545
	PRIVATE_KEY=your_private_key_here
	CONTRACT_ADDRESS=deployed_contract_address_here
	MONGO_URI=mongodb+srv://ankitsinghcs27:Ankit08!@tourist-webdash.7niphau.mongodb.net/?retryWrites=true&w=majority&appName=Tourist-WebDash
	MONGO_DBNAME=test
	```

3. **Start a local Hardhat node**
	```sh
	npx hardhat node
	```

4. **Deploy the smart contract**
   
	In a new terminal, run:
	```sh
	npx hardhat run scripts/deploy.js --network localhost
	```
	- Copy the deployed contract address from the output and update `CONTRACT_ADDRESS` in your `.env` file.

5. **Run the watcher**
	```sh
	node watcher.js
	```
	- This script listens for new users in MongoDB and writes them on-chain.

6. **Run the server (if needed)**
	```sh
	node server.js
	```

## Project Structure
- `contracts/` — Solidity smart contracts
- `scripts/` — Deployment scripts
- `artifacts/` — Compiled contract artifacts
- `watcher.js` — Watches MongoDB for new users and interacts with the blockchain
- `server.js` — (Optional) Backend server for blockchain operations

## Notes
- Make sure your MongoDB and Hardhat node are running before starting the watcher.
- Use the same private key for deploying and interacting with the contract.
- For production, use environment variables securely and never commit secrets.

---

For more details, see the main project README or contact the maintainers.
