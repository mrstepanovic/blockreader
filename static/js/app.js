document.getElementById("validator-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const validatorIndex = document.getElementById("validator-index").value;

    const response = await fetch("/blocks", {
        method: "POST",
        body: new FormData(event.target),
    });

    const data = await response.json();
    displayResults(data);
});

function displayResults(data) {
    // TODO: Create interactive visualizations using D3.js
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = JSON.stringify(data, null, 2);
}
