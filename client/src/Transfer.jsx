import { useState } from "react";
import server from "./server";
import {sha256 } from "ethereum-cryptography/sha256";
// const { sha256 } = require("ethereum-cryptography/sha256");
import * as secp from 'ethereum-cryptography/secp256k1';
import { utf8ToBytes, toHex } from "ethereum-cryptography/utils";
import { keccak256 } from "ethereum-cryptography/keccak";


function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();
    const amount = parseInt(sendAmount);
    const messageHash = toHex(sha256(utf8ToBytes(amount.toString())));
    const publicKey = secp.getPublicKey(privateKey);

    const signature = await secp.sign(messageHash, privateKey, {recovered: true});
    const isSigned = secp.verify(signature[0], messageHash, publicKey);

    const pubKey = secp.recoverPublicKey(messageHash, signature[0], signature[1]);
    const hexedHash = toHex(keccak256(pubKey.slice(1)).slice(-20));
    const prefixedSender = '0x' + hexedHash;
    
    if(isSigned === true) {
      try {
        const {
          data: { balance },
        } = await server.post(`send`, {
          sender: prefixedSender,
          amount: amount,
          recipient,
        });
        setBalance(balance);
      } catch (ex) {
        alert(ex.response.data.message);
      }
    } else {
      alert('Must have a verified signature to send this transaction')
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
