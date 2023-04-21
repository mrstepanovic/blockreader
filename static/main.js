async function fetchBlocks(event) {
    event.preventDefault();
  
    const validatorIndex = document.getElementById("validator-index").value;
  
    const response = await fetch("/blocks", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `validator_index=${validatorIndex}`,
    });
  
    const data = await response.json();
    displayBlocks(data.blocks);
  }
  
  function displayBlocks(blocks) {
    const blocksContainer = document.getElementById("blocks-container");
    blocksContainer.innerHTML = JSON.stringify(blocks, null, 2);
  }
  
  document.getElementById("fetch-blocks-form").addEventListener("submit", fetchBlocks);
  