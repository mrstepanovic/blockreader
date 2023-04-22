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
      container.appendChild(blockDiv);
  });
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
  drawChart(blocks);
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('blocks-form').addEventListener('submit', submitHandler);
});
