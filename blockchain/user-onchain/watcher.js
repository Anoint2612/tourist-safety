require("dotenv").config();
const { MongoClient } = require("mongodb");
const { ethers } = require("ethers"); // Hardhat v2.55 uses ethers v5
const crypto = require("crypto");
const artifact = require("./artifacts/contracts/UserRegistry.sol/UserRegistry.json");

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, artifact.abi, wallet);

  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  const db = client.db(process.env.MONGO_DBNAME || "test");
  const users = db.collection("users");
  console.log("Watcher connected to Mongo. Watching 'users' collection...");

  const pipeline = [{ $match: { operationType: "insert" } }];
  const changeStream = users.watch(pipeline, { fullDocument: "updateLookup" });

  changeStream.on("change", async (change) => {
    try {
      const doc = change.fullDocument;
      console.log("New user inserted:", doc._id);

      const payload = {
        _id: doc._id.toString(),
        email: doc.email || "",
        createdAt: doc.createdAt ? doc.createdAt.toISOString() : new Date().toISOString()
      };

      const jsonStr = JSON.stringify(payload);
      const hashHex = crypto.createHash("sha256").update(jsonStr).digest("hex");
      const bytes32 = "0x" + hashHex;

      console.log("Computed hash:", bytes32);

      const tx = await contract.recordUser(bytes32);
      console.log("Tx sent:", tx.hash);
      await tx.wait(1); // v5 style
      console.log("Tx confirmed for user:", doc._id.toString());
    } catch (err) {
      console.error("Error handling change:", err);
    }
  });

  changeStream.on("error", (err) => {
    console.error("ChangeStream error:", err);
  });
}

main().catch(err => { console.error(err); process.exit(1); });
