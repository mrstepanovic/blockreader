async function fetchBlocks(validatorIndex, epoch) {
  const response = await fetch(`/blocks?validator_index=${validatorIndex}&epoch=${epoch}`);
  const data = await response.json();
  const blocks = data.blocks.map(block => {
    return {
      ...block,
      transactions: block.transactions.map(tx => {
        return {
          ...tx,
          value: parseFloat(Web3.utils.fromWei(tx.value, 'ether')),
        };
      }),
    };
  });
  return blocks;
}

function displayBlocks(blocks) {
  const container = document.getElementById('results');
  container.innerHTML = '';

  blocks.forEach(block => {
    const blockDiv = document.createElement('div');
    blockDiv.innerHTML = `Slot: ${block.slot}, Block Root: ${block.block_root}`;

    const metricsDiv = document.createElement('div');

    const transactionHash = block.transactions[0].hash;
    const epochNumber = block.slot;
    const epochDatetime = new Date(block.timestamp * 1000);
    const totalTransactions = block.transactions.length;
    const totalEthTransacted = block.transactions.reduce((acc, tx) => acc + tx.value, 0);
    const blockReward = 2; // Replace with actual block reward value
    const averageEthPerTransaction = totalEthTransacted / totalTransactions;

    metricsDiv.innerHTML = `
      <strong>Transaction Hash:</strong> <a href="https://etherscan.io/tx/${transactionHash}" target="_blank">${transactionHash}</a><br>
      <strong>Epoch Number:</strong> ${epochNumber}<br>
      <strong>Epoch Datetime:</strong> ${epochDatetime}<br>
      <strong>Total Transactions:</strong> ${totalTransactions}<br>
      <strong>Total ETH Transacted:</strong> ${totalEthTransacted.toFixed(2)} ETH<br>
      <strong>Block Reward:</strong> ${blockReward} ETH<br>
      <strong>Average ETH per Transaction:</strong> ${averageEthPerTransaction.toFixed(2)} ETH
    `;

    container.appendChild(blockDiv);
    container.appendChild(metricsDiv);
  });

  // Pass the transactions from all blocks to the drawBubblePlot function
  const allTransactions = blocks.flatMap(block => block.transactions);
  drawBubblePlot(allTransactions);
}



async function submitHandler(event) {
  event.preventDefault();

  const validatorIndexInput = document.getElementById('validator-index');
  const epochInput = document.getElementById('epoch');

  const validatorIndex = validatorIndexInput.value;
  const epoch = epochInput.value;

  if (!validatorIndex || !epoch) {
    alert('Please enter both validator index and epoch.');
    return;
  }

  const blocks = await fetchBlocks(validatorIndex, epoch);
  displayBlocks(blocks);
  drawBubblePlot(blocks);
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('blocks-form').addEventListener('submit', submitHandler);
});

$(document).ready(function() {
  $('#validator-index').tooltip({ content: 'Enter the validator index number.' });
  $('#epoch').tooltip({ content: 'Enter the epoch number.' });
  $('#epoch').inputmask('9{1,10}');
});