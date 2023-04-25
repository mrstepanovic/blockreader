# blockreader: Inspect Proposed Blocks!
Blockreader is a web application that visualizes Ethereum transaction data within blocks proposed by a specific validator during a given epoch. The application fetches block data for a validator by index and epoch number and displays the transaction details in an interactive bubble plot.

## Features
* Fetch block data for a specific validator index and epoch number
* Visualize transactions in an interactive bubble plot
* Click on bubbles to open transaction details on Etherscan
* Display various transaction metrics, including total transactions, total ETH transacted, block rewards, and average ETH per transaction
# Getting Started

## Prerequisites
The application uses the following libraries and APIs:

* **D3.js** (version 5) - For creating the bubble plot visualization
* **Web3.js** (version 1.6.1) - For interacting with Ethereum data
* **jQuery** (version 3.6.0) and jQuery UI (version 1.12.1) - For handling user input and tooltips
* **Inputmask** (version 5.0.6) - For input validation

## Setup
1. Clone the repository to your local machine.
2. Set up a local web server to serve the application files. You can use any web server of your choice, such as Python's built-in HTTP server or Node.js http-server.
3. Open the application in your web browser by navigating to the appropriate URL (e.g., http://localhost:8000).

# Usage
To use Prospector:

1. Enter a validator index and epoch number in the respective input fields.
2. Click the "Get Blocks" button to fetch block data for the specified validator and epoch.
3. View the interactive bubble plot visualization of the transactions. Each bubble represents a single transaction, with size and color proportional to the amount of ETH transacted.
4. Hover over a bubble to see an abbreviated transaction hash. Click on a bubble to open the full transaction details on Etherscan in a new tab.
5. Scroll down to view various transaction metrics.

# Contributing
Contributions are welcome! Please feel free to submit issues or pull requests for bug fixes, feature requests, or improvements.

# License
This project is licensed under the MIT License - see the LICENSE file for details.
