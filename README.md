# 0G Storage TypeScript SDK Starter Kit

A starter kit demonstrating how to use the 0G Storage TypeScript SDK for decentralized file storage. This example implements a simple CLI tool showcasing the core SDK functionalities.

## Repository Branches

### 1. Master Branch
REST API implementation using Express framework with Swagger documentation.
```bash
git checkout master
```

- Features:
  - RESTful endpoints for upload/download
  - Swagger UI for API testing

### 2. CLI Version Branch (current)
Command-line interface implementation available in the cli-version branch.
```bash
git checkout cli-version
```

- Features:
  - Direct file upload/download via CLI
  - Command-line arguments for configuration

## Core Components (CLI Version)
```typescript
import { ZgFile, Indexer } from '@0glabs/0g-ts-sdk';  // Core SDK components
```

## Upload Process

### 1. Initialize Indexer
The first step is to create the necessary client for blockchain interaction and node management:
```typescript
// Initialize indexer with network configuration
const indexer = new Indexer(
  INDEXER_RPC,           // Indexer service endpoint
  RPC_URL,               // EVM RPC endpoint
  privateKey,            // For signing transactions
  FLOW_CONTRACT_STANDARD // Flow contract address
);
```
This sets up:
- Indexer client for managing storage operations
- Web3 connection for blockchain transactions
- Contract interaction capabilities

### 2. File Preparation & Merkle Tree Generation
Prepare the file and generate its Merkle tree:
```typescript
// Create ZgFile from file path
const zgFile = await ZgFile.fromFilePath(filepath);
const [tree, treeErr] = await zgFile.merkleTree();

if (treeErr !== null) {
  throw new Error(`Error generating Merkle tree: ${treeErr}`);
}
```
During this phase:
- File is prepared for upload
- Merkle tree is constructed for file verification
- File integrity is validated

### 3. Upload Operation
Execute the upload with blockchain transaction:
```typescript
// Upload file and get transaction hash
const [tx, uploadErr] = await indexer.upload(zgFile);

if (uploadErr !== null) {
  throw new Error(`Upload error: ${uploadErr}`);
}

console.log('Upload successful!');
console.log('Root Hash:', tree?.rootHash() ?? '');
console.log('Transaction Hash:', tx);
```
This process:
- Creates and signs a storage transaction
- Uploads file to the network
- Returns transaction and root hashes for verification

## Download Process

### 1. Download Operation
Retrieve and verify the file:
```typescript
const err = await indexer.download(rootHash, outputPath, true);

if (err !== null) {
  throw new Error(`Download error: ${err}`);
}

console.log('Download successful!');
console.log('File saved to:', outputPath);
```
The process includes:
- File location using root hash
- Automatic node selection
- File integrity verification
- Local file saving

## Quick Start Examples

### Upload a file
```bash
npm start -- -k YOUR_PRIVATE_KEY upload ./path/to/file
# Output:
# Upload successful!
# Root Hash: 0xdef... (file identifier)
# Transaction Hash: 0xabc... (blockchain transaction)
```

### Download a file
```bash
npm start -- -k YOUR_PRIVATE_KEY download 0xdef... -o ./downloaded_file
# Output:
# Download successful!
# File saved to: ./downloaded_file
```

## Command Options
```bash
Global Options:
  -k, --key <private_key>    Private key for signing transactions (required)
  -h, --help                 Display help for command
  -V, --version             Output the version number

Commands:
  upload <filepath>          Upload a file to 0G Storage
  download <roothash>        Download a file from 0G Storage
  config                     Show current configuration

Download Options:
  -o, --output <path>       Output path for downloaded file
```

## Network Configuration
```typescript
// Default network configuration
const RPC_URL = 'https://evmrpc-testnet.0g.ai/';
const FLOW_CONTRACT_STANDARD = '0x0460aA47b41a66694c0a73f667a1b795A5ED3556';
const INDEXER_RPC = 'https://indexer-storage-testnet-standard.0g.ai';
```

## Best Practices
1. **Resource Management**:
   - Always close ZgFile instances after use
   - Clean up temporary files
   - Handle errors appropriately

2. **Security**:
   - Keep your private key secure
   - Never share your private key
   - Use different keys for testing and production

3. **Error Handling**:
   - Check for upload/download errors
   - Validate Merkle tree generation
   - Handle network timeouts appropriately

## Development

For development with hot reloading:
```bash
npm run dev -- -k YOUR_PRIVATE_KEY <command>
```

To watch for changes and rebuild:
```bash
npm run watch
```

## Next Steps
Explore advanced SDK features in the [0G Storage TypeScript SDK documentation](https://github.com/0glabs/0g-ts-sdk). Learn more about the [0G Storage Network](https://docs.0g.ai/0g-storage). 