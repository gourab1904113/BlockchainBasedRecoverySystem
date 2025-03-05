import contractABI from "./abi.json";
import Web3 from "web3";
// 2️⃣ Set your smart contract address 👇
const contractAddress = "0x736f3AA5b93649E42aEAe17cd4b74aFd4d86197C";
let userAddress;

let web3 = new Web3(window.ethereum);
// 3️⃣ connect to the contract using web3
// HINT: https://web3js.readthedocs.io/en/v1.2.11/web3-eth-contract.html#new-contract
// let contract = YOUR CODE
let contract = new web3.eth.Contract(contractABI, contractAddress);

async function connectWallet() {
  if (window.ethereum) {
    // 1️⃣ Request Wallet Connection from Metamask
    // ANSWER can be found here: https://docs.metamask.io/wallet/get-started/set-up-dev-environment/
    // const accounts = YOUR CODE

    const accounts = await window.ethereum
      .request({ method: "eth_requestAccounts" })
      .catch((err) => {
        if (err.code === 4001) {
          console.log("plese connect to metamask");
        } else {
          console.error(err);
        }
      });
    setConnected(accounts[0]);
  } else {
    console.error("No web3 provider detected");
    document.getElementById("connectMessage").innerText =
      "No web3 provider detected. Please install MetaMask.";
  }
}

async function createTweet(content) {
  const accounts = await web3.eth.getAccounts();
  try {
    // 4️⃣ call the contract createTweet method in order to crete the actual TWEET
    // HINT: https://web3js.readthedocs.io/en/v1.2.11/web3-eth-contract.html#methods-mymethod-send
    // use the "await" feature to wait for the function to finish execution
    // what is await? https://javascript.info/async-await

    await contract.methods.add_data(content).send({ from: accounts[0] });
    // 7️⃣ Uncomment the displayTweets function! PRETTY EASY 🔥
    // GOAL: reload tweets after creating a new tweet
    // displayTweets(accounts[0]);
  } catch (error) {
    console.error("User rejected request:", error);
  }
}

async function displayTweets(userAddress) {
  const tweetsContainer = document.getElementById("tweetsContainer");
  const tempTweets = [];
  tweetsContainer.innerHTML = "";
  // 5️⃣ call the function getAllTweets from smart contract to get all the tweets
  // HINT: https://web3js.readthedocs.io/en/v1.2.11/web3-eth-contract.html#methods-mymethod-call
  // tempTweets = await YOUR CODE

  // we do this so we can sort the tweets  by timestamp
  const tweets = [...tempTweets];
  tweets.sort((a, b) => b.timestamp - a.timestamp);
  for (let i = 0; i < tweets.length; i++) {
    const tweetElement = document.createElement("div");
    tweetElement.className = "tweet";

    const userIcon = document.createElement("img");
    userIcon.className = "user-icon";
    userIcon.src = `https://avatars.dicebear.com/api/human/${tweets[i].author}.svg`;
    userIcon.alt = "User Icon";

    tweetElement.appendChild(userIcon);

    const tweetInner = document.createElement("div");
    tweetInner.className = "tweet-inner";

    tweetInner.innerHTML += `
        <div class="author">${shortAddress(tweets[i].author)}</div>
        <div class="content">${tweets[i].content}</div>
    `;

    const likeButton = document.createElement("button");
    likeButton.className = "like-button";
    likeButton.innerHTML = `
        <i class="far fa-heart"></i>
        <span class="likes-count">${tweets[i].likes}</span>
    `;
    likeButton.setAttribute("data-id", tweets[i].id);
    likeButton.setAttribute("data-author", tweets[i].author);

    addLikeButtonListener(
      likeButton,
      userAddress,
      tweets[i].id,
      tweets[i].author
    );
    tweetInner.appendChild(likeButton);
    tweetElement.appendChild(tweetInner);

    tweetsContainer.appendChild(tweetElement);
  }
}

function addLikeButtonListener(likeButton, address, id, author) {
  likeButton.addEventListener("click", async (e) => {
    e.preventDefault();

    e.currentTarget.innerHTML = '<div class="spinner"></div>';
    e.currentTarget.disabled = true;
    try {
      await likeTweet(author, id);
      displayTweets(address);
    } catch (error) {
      console.error("Error liking tweet:", error);
    }
  });
}

function shortAddress(address, startLength = 6, endLength = 4) {
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}

async function likeTweet(author, id) {
  try {
    // 8️⃣ call the likeTweet function from smart contract
    // INPUT: author and id
    // GOAL: Save the like in the smart contract
    // HINT: don't forget to use await 😉 👇
  } catch (error) {
    console.error("User rejected request:", error);
  }
}

///here Change the display when connected
function setConnected(address) {
  userAddress = address;
  document.getElementById("userAddress").innerText =
    "Connected: " + shortAddress(address);
  document.getElementById("connectMessage").style.display = "none";
  document.getElementById("tweetForm").style.display = "block";
  document.getElementById("verifierInput").style.display = "block";
  document.getElementById("verifierAdd").style.display = "block";
  document.getElementById("verifierRemove").style.display = "block";

  document.getElementById("storeHash").style.display = "block";
  document.getElementById("storeKeyHash").style.display = "block";
  //displayTweets(address);

  // 6️⃣ Call the displayTweets function with address as input
  // This is the function in the javascript code, not smart contract 😉
  // GOAL: display all tweets after connecting to metamask
}

async function fetchData() {
  // Get the value entered in the textarea
  const dataInput = document.getElementById("dataInput").value;

  console.log(dataInput);

  // Call another function to process and return data
  const result = await contract.methods.get_data(dataInput).call();

  // Display the result in the output area
  document.getElementById("dataOutput").innerText = result;
}
// Attach event listener to the button
document.getElementById("get_data").addEventListener("click", fetchData);

async function setMinVerifierCount() {
  // Get the entered verifier count value
  const countValue = document.getElementById("verifierCount").value;

  if (!countValue) {
    document.getElementById("statusMessage").innerText =
      "Please enter a valid number.";
    return;
  }

  try {
    // Assume contract is already initialized

    const result = await contract.methods
      .set_min_verifier_count(countValue)
      .send({ from: userAddress });

    // Show success message
    document.getElementById("statusMessage").innerText = countValue;
    console.log("Transaction details:", countValue);
  } catch (error) {
    console.error("Error setting verifier count:", error);
    document.getElementById("statusMessage").innerText =
      "Error setting verifier count.";
  }
}

document
  .getElementById("submitBtn")
  .addEventListener("click", setMinVerifierCount);

// Function to add a verifier
async function addVerifier() {
  // Get the verifier address from the text area
  const verifierAddress = document.getElementById("verifierAddress").value;
  try {
    // Call the smart contract function to add the verifier
    await contract.methods
      .add_verifier(verifierAddress)
      .send({ from: userAddress });

    // Show success message
    document.getElementById("VerifierOutput").innerText =
      "Verifier added successfully!";
  } catch (error) {
    console.error("Error adding verifier:", error);
    document.getElementById("VerifierOutput").innerText =
      "Error adding verifier.";
  }
}

// Attach event listener to the button
document
  .getElementById("addVerifierBtn")
  .addEventListener("click", addVerifier);

// Function to store_hash
async function storedHash() {
  // Get the verifier address from the text area
  const data = document.getElementById("DataHash").value;
  const index = document.getElementById("Datanumber").value;
  console.log(index);
  console.log(data);
  try {
    // Call the smart contract function to add the verifier
    const res = await contract.methods
      .store_hash(data, index)
      .send({ from: userAddress });
    // Show success message
    document.getElementById("StoreHashOutput").innerText =
      "Hash stored successfully!";
  } catch (error) {
    console.error("Error storing Hash:", error);
    document.getElementById("StoreHashOutput").innerText = "Error storing Hash";
  }
}

// Attach event listener to the button
document.getElementById("storeHashData").addEventListener("click", storedHash);

// Function to store_hash
async function storedKeyHash() {
  // Get the verifier address from the text area
  const data = document.getElementById("KeyHash").value;
  const index = document.getElementById("Keynumber").value;
  console.log(index);
  console.log(data);
  try {
    // Call the smart contract function to add the verifier
    const res = await contract.methods
      .storeKey_hash(data, index)
      .send({ from: userAddress });
    // Show success message
    document.getElementById("StoreHashKeyOutput").innerText =
      "Hash stored successfully!";
  } catch (error) {
    console.error("Error storing Hash:", error);
    document.getElementById("StoreHashKeyOutput").innerText =
      "Error storing Hash";
  }
}

// Attach event listener to the button
document
  .getElementById("storeHashKey")
  .addEventListener("click", storedKeyHash);

// Function to verify store_hash
async function verifystoredHash() {
  // Get the verifier address from the text area
  const account = document.getElementById("verifierHashaddress").value;
  const data = document.getElementById("verifyDataHash").value;
  const index = document.getElementById("verifyDatanumber").value;
  console.log(index);
  console.log(data);
  try {
    // Call the smart contract function to add the verifier
    const res = await contract.methods.verify_data(account, data, index).call();
    // Show success message
    let output = "";
    console.log(res);
    if (res) {
      output = "Verified";
    } else {
      output = "Not verified";
    }
    document.getElementById("verifyStoreHashOutput").innerText = output;
  } catch (error) {
    console.error("Error to verify:", error);
    document.getElementById("verifyStoreHashOutput").innerText =
      "Error to verify";
  }
}

// Attach event listener to the button
document
  .getElementById("verifystoreHashData")
  .addEventListener("click", verifystoredHash);

// Function to verify store_hash
async function verifyKeyHash() {
  // Get the verifier address from the text area
  const account = document.getElementById("verifierKeyHashaddress").value;
  const data = document.getElementById("verifyKeyinput").value;
  const index = document.getElementById("verifyKeynumber").value;
  console.log(index);
  console.log(data);
  try {
    // Call the smart contract function to add the verifier
    const res = await contract.methods.verify_key(account, data, index).call();

    // Show success message
    let output2 = "";
    console.log(res);
    if (res) {
      output2 = "Verified";
    } else {
      output2 = "Not verified";
    }
    document.getElementById("verifyStoreHashKeyOutput").innerText = output2;
  } catch (error) {
    console.error("Error to verify:", error);
    document.getElementById("verifyStoreHashKeyOutput").innerText =
      "Error to verify";
  }
}

// Attach event listener to the button
document
  .getElementById("verifystoreHashKey")
  .addEventListener("click", verifyKeyHash);

async function getMinVerifierCount() {
  try {
    // Call the smart contract function to get the value
    const verifierCountInput =
      document.getElementById("verifierCountInput").value;
    const result = await contract.methods
      .get_min_verifier_count(verifierCountInput)
      .call();

    // Display the result in the output area
    document.getElementById("verifierCountOutput").innerText = result;
  } catch (error) {
    console.error("Error fetching verifier count:", error);
    document.getElementById("verifierCountOutput").innerText =
      "Error fetching count.";
  }
}
document
  .getElementById("getCountBtn")
  .addEventListener("click", getMinVerifierCount);

// Function to remove a verifier
async function removeVerifier() {
  // Get the verifier address from the text area
  const verifierAddress = document.getElementById(
    "RemoveAddressVerifier"
  ).value;

  // Check if an address is entered
  if (!verifierAddress) {
    document.getElementById("removeVerifierstatus").innerText =
      "Please enter a valid address.";
    return;
  }

  try {
    // Call the smart contract function to remove the verifier
    await contract.methods
      .remove_verifier(verifierAddress)
      .send({ from: userAddress });

    // Show success message
    document.getElementById("removeVerifierstatus").innerText =
      "Verifier removed successfully!";
  } catch (error) {
    console.error("Error removing verifier:", error);
    document.getElementById("removeVerifierstatus").innerText =
      "Error removing verifier.";
  }
}

// Attach event listener to the button
document
  .getElementById("removeVerifierBtn")
  .addEventListener("click", removeVerifier);

async function isverified() {
  try {
    // Call the smart contract function to get the value
    const verifierInput = document.getElementById("checkVerify").value;
    const result = await contract.methods.is_verified(verifierInput).call();

    // Display the result in the output area
    document.getElementById("verifiedOutput").innerText = result;
  } catch (error) {
    console.error("Error fetching verifier count:", error);
    document.getElementById("verifiedOutput").innerText =
      "Error fetching count.";
  }
}
document.getElementById("isVerified").addEventListener("click", isverified);

// Function to get verifier addresses
async function getVerifiers() {
  // Get optional input data (if needed by the contract)
  const inputData = document.getElementById("inputAccount").value.trim();

  try {
    // Call the smart contract function to get verifier addresses
    const verifiers = await contract.methods.get_verifiers(inputData).call();

    // Format and display the addresses
    const verifierListDiv = document.getElementById("verifierList");
    verifierListDiv.innerHTML = ""; // Clear previous results

    if (verifiers.length === 0) {
      verifierListDiv.innerHTML = "<p>No verifiers found.</p>";
    } else {
      const list = document.createElement("ul");
      verifiers.forEach((address) => {
        const listItem = document.createElement("li");
        listItem.innerText = address;
        list.appendChild(listItem);
      });
      verifierListDiv.appendChild(list);
    }
  } catch (error) {
    console.error("Error fetching verifiers:", error);
    document.getElementById("verifierList").innerText =
      "Error fetching verifiers.";
  }
}

// Attach event listener to the button
document
  .getElementById("getVerifiersBtn")
  .addEventListener("click", getVerifiers);

// Function to verify an account
async function verifyAccount() {
  // Get the account address from the text area
  const accountAddress = document.getElementById("inputAccountAddress").value;

  // Check if an address is entered
  if (!accountAddress) {
    document.getElementById("VerificationstatusMessage").innerText =
      "Please enter a valid account address.";
    return;
  }

  try {
    // Call the smart contract function to verify the account
    await contract.methods
      .verify_account(accountAddress)
      .send({ from: userAddress });

    // Show success message
    document.getElementById("VerificationstatusMessage").innerText =
      "Account verified successfully!";
  } catch (error) {
    console.error("Error verifying account:", error);
    document.getElementById("VerificationstatusMessage").innerText =
      "Error verifying account.";
  }
}

// Attach event listener to the button
document
  .getElementById("VerifyAccountBtn")
  .addEventListener("click", verifyAccount);

document
  .getElementById("connectWalletBtn")
  .addEventListener("click", connectWallet);

document.getElementById("tweetForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const content = document.getElementById("tweetContent").value;
  const tweetSubmitButton = document.getElementById("tweetSubmitBtn");
  tweetSubmitButton.innerHTML = '<div class="spinner"></div>';
  tweetSubmitButton.disabled = true;
  try {
    await createTweet(content);
  } catch (error) {
    console.error("Error sending tweet:", error);
  } finally {
    // Restore the original button text
    //tweetSubmitButton.innerHTML = "Tweet";
    tweetSubmitButton.disabled = false;
  }
});

//user Part
async function generateKeys() {
  const inputText = document
    .getElementById("GenerateKeyInputText")
    .value.trim();
  const count = parseInt(
    document.getElementById("GenerateKeyInputNumber").value,
    10
  );

  if (inputText === "") {
    alert("Please enter some text!");
    return;
  }
  if (isNaN(count) || count <= 0) {
    alert("Please enter a valid number greater than 0!");
    return;
  }

  const response = await fetch("http://127.0.0.1:5000/GenerateKeys", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: inputText, count: count }),
  });

  const data = await response.json();
  const outputList = document.getElementById("GenerateKeyOutput");

  outputList.innerHTML = ""; // Clear previous output

  if (data.result) {
    data.result.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      outputList.appendChild(li);
    });
  } else {
    alert("Error: " + data.error);
  }
}

document
  .getElementById("GenerateKeyButton")
  .addEventListener("click", generateKeys);

async function EncryptData() {
  const inputEncryptionText = document
    .getElementById("inputEncryptionText")
    .value.trim();
  const key = document.getElementById("inputEncryptionKey").value.trim();

  console.log(inputEncryptionText);
  console.log(key);

  if (inputEncryptionText === "" || key === "") {
    alert("Please enter some text!");
    return;
  }

  const response = await fetch("http://127.0.0.1:5000/Encryption", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: inputEncryptionText, key: key }),
  });

  const data = await response.json();
  const output = document.getElementById("EncryptOutput");

  // Clear previous output
  console.log(data.result);

  if (data.result) {
    output.innerHTML = data.result;
  } else {
    alert("Error: " + data.error);
  }
}

document.getElementById("encryptText").addEventListener("click", EncryptData);

async function DecryptData() {
  const inputDecryptionText = document
    .getElementById("inputDecryptionText")
    .value.trim();
  const key = document.getElementById("inputDecryptionKey").value.trim();

  console.log(inputDecryptionText);
  console.log(key);

  if (inputDecryptionText === "" || key === "") {
    alert("Please enter some text!");
    return;
  }

  const response = await fetch("http://127.0.0.1:5000/Decryption", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: inputDecryptionText, key: key }),
  });

  const data = await response.json();
  const output = document.getElementById("DecryptOutput");

  // Clear previous output
  console.log(data.result);

  if (data.result) {
    output.innerHTML = data.result;
  } else {
    alert("Error: " + data.error);
  }
}

document.getElementById("decryptText").addEventListener("click", DecryptData);
//Generate Share
async function generateShare() {
  const inputText = document
    .getElementById("GenerateShareInputText")
    .value.trim();
  const count = parseInt(
    document.getElementById("GenerateShareInputNumber").value,
    10
  );
  const mincount = parseInt(
    document.getElementById("MinShareInputNumber").value,
    10
  );

  if (inputText === "") {
    alert("Please enter some text!");
    return;
  }
  if (isNaN(count) || count <= 0) {
    alert("Please enter a valid number greater than 0!");
    return;
  }

  const response = await fetch("http://127.0.0.1:5000/GenerateShare", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: inputText, count: count, mincount: mincount }),
  });

  const data = await response.json();
  const outputList = document.getElementById("GenerateShareOutput");

  outputList.innerHTML = ""; // Clear previous output

  if (data.result) {
    data.result.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item[1];
      outputList.appendChild(li);
    });
  } else {
    alert("Error: " + data.error);
  }
}

document
  .getElementById("GenerateShareButton")
  .addEventListener("click", generateShare);

async function ConstructData() {
  const Text = document.getElementById("ConstructDataInputText").value.trim();

  if (Text === "") {
    alert("Please enter some text!");
    return;
  }

  const response = await fetch("http://127.0.0.1:5000/ConstructData", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: Text }),
  });

  const data = await response.json();
  const output = document.getElementById("ConstructDataOutput");

  if (data.result) {
    output.innerHTML = data.result;
  } else {
    alert("Error: " + data.error);
  }
}

document
  .getElementById("ConstructDataButton")
  .addEventListener("click", ConstructData);

async function GeneratePublicKey() {
  const Text = document
    .getElementById("GeneratePublicKeyInputText")
    .value.trim();

  console.log(Text);

  if (Text === "") {
    alert("Please enter some text!");
    return;
  }

  const response = await fetch("http://127.0.0.1:5000/GeneratePublicKey", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: Text }),
  });

  const data = await response.json();
  const output = document.getElementById("GeneratePublicKeyOutput");

  if (data.result) {
    output.innerHTML = `Public Key:<br>
      x: ${data.result.x} <br>
      y: ${data.result.y}`;
  } else {
    alert("Error: " + (data.error || "Unknown error"));
  }
}

document
  .getElementById("GeneratePublicKeyButton")
  .addEventListener("click", GeneratePublicKey);

async function generateSecretKey() {
  const privateKeyHex = document.getElementById("privateKeyInput").value.trim();
  const publicKeyXHex = document.getElementById("publicKeyXInput").value.trim();
  const publicKeyYHex = document.getElementById("publicKeyYInput").value.trim();

  if (!privateKeyHex || !publicKeyXHex || !publicKeyYHex) {
    alert("Please enter all values!");
    return;
  }

  const response = await fetch("http://127.0.0.1:5000/GenerateSecretKey", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      private_key: privateKeyHex,
      public_key_x: publicKeyXHex,
      public_key_y: publicKeyYHex,
    }),
  });

  const data = await response.json();
  const output = document.getElementById("secretKeyOutput");

  if (data.secret_key) {
    output.innerText = `Secret Key: ${data.secret_key}`;
  } else {
    alert("Error: " + (data.error || "Unknown error"));
  }
}

document
  .getElementById("generateSecretKeyButton")
  .addEventListener("click", generateSecretKey);

async function storeDataIPFS() {
  const data = document.getElementById("inputDataIPFS").value.trim();

  if (data === "") {
    alert("Please enter some data to store.");
    return;
  }

  const response = await fetch("http://127.0.0.1:5000/storeIPFS", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });

  const result = await response.json();
  if (result.hash) {
    document.getElementById("ipfsHash").innerText = result.hash;
  } else {
    alert("Error storing data.");
  }
}

document
  .getElementById("IPFSStoreButton")
  .addEventListener("click", storeDataIPFS);

async function retrieveDataIPFS() {
  const data = document.getElementById("hashInput").value.trim();

  if (!data) {
    alert("Please enter an IPFS hash.");
    return;
  }

  const response = await fetch("http://127.0.0.1:5000/retrieveIPFS", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });

  const result = await response.json();
  if (result.data) {
    document.getElementById("ipfsData").innerText = result.data;
  } else {
    alert("Error retrieving data.");
  }
}

document
  .getElementById("IPFSRetreiveButton")
  .addEventListener("click", retrieveDataIPFS);
