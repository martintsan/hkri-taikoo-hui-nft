require("dotenv").config();
const API_URL = process.env.API_URL;
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const alchemyWeb3 = createAlchemyWeb3(API_URL);
const contract = require("../artifacts/contracts/HkriTaikooHuiNFT.sol/HkriTaikooHui.json");

const METAMASK_PUBLIC_KEY = process.env.METAMASK_PUBLIC_KEY;
const METAMASK_PRIVATE_KEY = process.env.METAMASK_PRIVATE_KEY;

const contractAddress = "0x026FBBB73feF93a2b27258b1f7b8cd13D2dd8007";
const nftContract = new alchemyWeb3.eth.Contract(contract.abi, contractAddress);

async function mintNFT(uri) {
  // 获取 nonce - nonce 是出于安全考虑，它用于记录交易序号以防止重放攻击
  const nonce = await alchemyWeb3.eth.getTransactionCount(
    METAMASK_PUBLIC_KEY,
    "latest"
  );
  const tx = {
    from: METAMASK_PUBLIC_KEY, // 我们 MetaMask 的公钥
    to: contractAddress, // 智能合约地址
    nonce: nonce, // nonce
    gas: 1000000, // 完成交易的预估汽油费
    data: nftContract.methods
      .safeMint("0xEB0EC48d8D5aD7745726B627f4297f5023086f60", uri) // 新建了一个钱包来接收 NFT
      .encodeABI(),
  };

  const signPromise = alchemyWeb3.eth.accounts.signTransaction(
    tx,
    METAMASK_PRIVATE_KEY
  );
  signPromise
    .then((signedTx) => {
      alchemyWeb3.eth.sendSignedTransaction(
        signedTx.rawTransaction,
        function (err, hash) {
          if (!err) {
            console.log(
              "The hash of our transaction is: ",
              hash,
              "\nCheck Alchemy's Mempool to view the status of our transaction!"
            );
          } else {
            console.log(
              "Something went wrong when submitting our transaction:",
              err
            );
          }
        }
      );
    })
    .catch((err) => {
      console.log(" Promise failed:", err);
    });
}

mintNFT("https://ipfs.io/ipfs/QmWEsQXpHLJ5V92tR7VhPhbYBtBMZwAiN2DtTAm6D8vGxj");