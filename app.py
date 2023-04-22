from flask import Flask, jsonify, request, render_template
from web3 import Web3
import requests
import os

from web3.middleware import geth_poa_middleware

app = Flask(__name__)

INFURA_API_KEY = "820c63c37c9c4e37b8d6e2eb39ffe72a"
ETHEREUM_NETWORK = "mainnet"

WEB3_PROVIDER = f"https://{ETHEREUM_NETWORK}.infura.io/v3/{INFURA_API_KEY}"
w3 = Web3(Web3.HTTPProvider(WEB3_PROVIDER))
w3.middleware_onion.inject(geth_poa_middleware, layer=0)

ETHERSCAN_API_KEY = "EAM1ZQSS1WX22BVB99EG3DHETXIBXZF1A5"
ETHERSCAN_API_URL = "https://api.etherscan.io/api"

def fetch_proposed_blocks(validator_index, api_key, epochs):
    BASE_URL = "https://beaconcha.in/api/v1"
    proposals_url = f"{BASE_URL}/validator/{validator_index}/proposals?epoch={epochs}"
    
    if api_key:
        headers = {"apikey": api_key}
        response = requests.get(proposals_url, headers=headers)
    else:
        response = requests.get(proposals_url)

    if response.status_code != 200:
        return []

    blocks_data = response.json()["data"]
    return blocks_data

def get_transactions_from_block(block_number):
    params = {
        "module": "proxy",
        "action": "eth_getBlockByNumber",
        "tag": hex(int(block_number)),
        "boolean": "true",
        "apikey": ETHERSCAN_API_KEY,
    }

    response = requests.get(ETHERSCAN_API_URL, params=params)
    if response.status_code == 200:
        json_data = response.json()
        transactions = json_data["result"]["transactions"]
        return transactions
    else:
        return []


def classify_transaction(tx):
    # Simplified example - add more cases as needed
    if tx["to"] == "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D":  # Uniswap
        return "Uniswap Swap"
    elif tx["to"] == "0x7Be8076f4EA4A4AD08075C2508e481d6C946D12b":  # OpenSea
        return "OpenSea NFT Trade"
    else:
        return "Other"

def check_ofac_compliance(tx):
    # Placeholder function for checking OFAC compliance. Replace with actual implementation.
    return True

def classify_transaction(transaction):
    to_address = transaction['to']
    input_data = transaction['input']

    if input_data == '0x':
        return 'direct'

    if len(input_data) > 74 and input_data[:10] == '0xa9059cbb':
        return 'erc20'

    if input_data[:10] in ['0x23b872dd', '0x42842e0e']:
        return 'erc721'

    return 'smart_contract'

def group_transactions_by_type(blocks):
    grouped_transactions = {
        'direct': 0,
        'erc20': 0,
        'erc721': 0,
        'smart_contract': 0,
    }

    for block in blocks:
        transactions = block.get('transactions', [])

        for transaction in transactions:
            tx_type = classify_transaction(transaction)
            grouped_transactions[tx_type] += 1

    return grouped_transactions

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/blocks', methods=['GET'])
def blocks():
    validator_index = request.args.get('validator_index')
    epoch = request.args.get('epoch')

    # Fetch proposed blocks for the specified epoch
    blocks = fetch_proposed_blocks(validator_index, "", epoch)

    # Fetch transactions for each block
    blocks_with_transactions = []
    for block in blocks:
        block_number = block['slot']
        block_root = block['blockroot']
        transactions = get_transactions_from_block(block_number)
        block['transactions'] = transactions
        blocks_with_transactions.append({
            'slot': block_number,
            'block_root': block_root,
            'transactions': transactions
        })

    # Group transactions by type
    grouped_transactions = group_transactions_by_type(blocks_with_transactions)

    return jsonify(blocks=blocks_with_transactions, grouped_transactions=grouped_transactions)


@app.route("/transaction-data", methods=["GET"])
def transaction_data():
    block_number = request.args.get("block_number")
    params = {
        "module": "proxy",
        "action": "eth_getBlockByNumber",
        "tag": hex(int(block_number)),
        "boolean": "true",
        "apikey": ETHERSCAN_API_KEY,
    }

    response = requests.get(ETHERSCAN_API_URL, params=params)
    if response.status_code == 200:
        json_data = response.json()
        for tx in json_data["result"]["transactions"]:
            tx_type = classify_transaction(tx)
            ofac_status = check_ofac_compliance(tx)
            tx["transactionType"] = tx_type
            tx["ofac_compliant"] = ofac_status
        return jsonify(json_data)
    else:
        return jsonify({"error": "Failed to fetch transaction data"}), 500

if __name__ == '__main__':
    app.run(debug=True)