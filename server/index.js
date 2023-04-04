const { sha256 } = require("ethereum-cryptography/sha256");
const secp = require("ethereum-cryptography/secp256k1");
const { utf8ToBytes, toHex } = require("ethereum-cryptography/utils");


const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "0x718895062c0572221fc6a60b255583b79d45748d": 100,
  "0xdb50a640b55076ffac6522bf89a51db618c3332c": 50,
  "0xaab12143fc056f025ba235dedd3ae15c37ad26c6": 75,
  "0xcc8331b98c718d12928bed48ec0d822ee87657a2": 200,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", async (req, res) => {
  //TODO: get a signature from the client-side application
  //recover the public address from the signature
  //this is going to be the sender. Dont want to allow the client to set the sender

  const { sender, recipient, amount } = req.body;


  setInitialBalance(sender);
  setInitialBalance(recipient);

  console.log('sender: ', sender);
    if (balances[sender] < amount) {
      res.status(400).send({ message: "Not enough funds!" });
    } else {
      balances[sender] -= amount;
      balances[recipient] += amount;
      res.send({ balance: balances[sender] });
    }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
