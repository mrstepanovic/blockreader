from flask import Flask, jsonify, request, render_template
from web3 import Web3
import requests

from web3.middleware import geth_poa_middleware

# TODO: import ofac_tools

app = Flask(__name__)

INFURA_API_KEY = "820c63c37c9c4e37b8d6e2eb39ffe72a"
ETHEREUM_NETWORK = "mainnet"  # Change to "mainnet" when you're ready to deploy
WEB3_PROVIDER = f"https://{ETHEREUM_NETWORK}.infura.io/v3/{INFURA_API_KEY}"
w3 = Web3(Web3.HTTPProvider(WEB3_PROVIDER))

# Add this line after initializing the Web3 instance (w3)
w3.middleware_onion.inject(geth_poa_middleware, layer=0)

def fetch_proposed_blocks(validator_index, api_key, epochs):
    # Use the Beacon Chain API to fetch the blocks proposed by the validator
    BASE_URL = "https://beaconcha.in/api/v1"
    proposals_url = f"{BASE_URL}/validator/{validator_index}/proposals?epochs={epochs}"
    
    if api_key:
        headers = {"apikey": api_key}
        response = requests.get(proposals_url, headers=headers)
    else:
        response = requests.get(proposals_url)

    if response.status_code != 200:
        return []

    blocks_data = response.json()["data"]
    return blocks_data


def process_transactions(blocks):
    processed_data = []

    for block in blocks:
        block_slot = block["slot"]
        block_hash = block["blockRoot"]
        block_transactions = []  # Fetch the transactions from the block (we'll add this later)

        # Fetch the block from the Ethereum network using the block hash
        eth_block = w3.eth.getBlock(block_hash)
        block_transactions = eth_block.transactions

        for tx in block_transactions:
            # Classify the transaction based on its type
            tx_type = classify_transaction(tx)

            # Check if the transaction is OFAC compliant
            ofac_status = ofac_tools.check_ofac_compliance(tx)

            processed_data.append({
                "block_slot": block_slot,
                "block_hash": block_hash,
                "transaction_hash": tx["hash"],
                "transaction_type": tx_type,
                "ofac_compliant": ofac_status
            })

    return processed_data

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/blocks', methods=['GET'])
def blocks():
    validator_index = request.args.get('validator_index')
    epoch = request.args.get('epoch')

    # Fetch proposed blocks for the specified epoch
    blocks = fetch_proposed_blocks(validator_index, None, epoch)
    return jsonify(blocks=blocks)

if __name__ == '__main__':
    app.run(debug=True)