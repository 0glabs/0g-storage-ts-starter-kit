import { Command } from 'commander';
import { ZgFile, Indexer } from '@0glabs/0g-ts-sdk';
import path from 'path';
import fs from 'fs';

// Network Constants
const RPC_URL = 'https://evmrpc-testnet.0g.ai/';
const FLOW_CONTRACT_STANDARD = '0x0460aA47b41a66694c0a73f667a1b795A5ED3556';
const INDEXER_RPC = 'https://indexer-storage-testnet-standard.0g.ai';

// Create downloads directory if it doesn't exist
const downloadsDir = path.join(process.cwd(), 'downloads');
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir);
}

const program = new Command();

program
  .name('0g-storage')
  .description('CLI tool for interacting with 0G Storage network')
  .version('1.0.0')
  .requiredOption('-k, --key <private_key>', 'private key for signing transactions');

program
  .command('upload')
  .description('Upload a file to 0G Storage')
  .argument('<filepath>', 'path to the file to upload')
  .action(async (filepath: string) => {
    try {
      const privateKey = program.opts().key;
      const indexer = new Indexer(INDEXER_RPC, RPC_URL, privateKey, FLOW_CONTRACT_STANDARD);
      
      console.log('Uploading file:', filepath);
      
      // Create ZgFile from file path
      const zgFile = await ZgFile.fromFilePath(filepath);
      const [tree, treeErr] = await zgFile.merkleTree();
      
      if (treeErr !== null) {
        throw new Error(`Error generating Merkle tree: ${treeErr}`);
      }

      // Upload file
      const [tx, uploadErr] = await indexer.upload(zgFile);

      if (uploadErr !== null) {
        throw new Error(`Upload error: ${uploadErr}`);
      }

      await zgFile.close();

      console.log('Upload successful!');
      console.log('Root Hash:', tree?.rootHash() ?? '');
      console.log('Transaction Hash:', tx);
    } catch (error) {
      console.error('Upload error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('download')
  .description('Download a file from 0G Storage')
  .argument('<roothash>', 'root hash of the file to download')
  .option('-o, --output <path>', 'output path for downloaded file')
  .action(async (rootHash: string, options: { output?: string }) => {
    try {
      const privateKey = program.opts().key;
      const indexer = new Indexer(INDEXER_RPC, RPC_URL, privateKey, FLOW_CONTRACT_STANDARD);
      
      console.log('Downloading file with root hash:', rootHash);
      
      const outputPath = options.output || path.join(downloadsDir, rootHash);
      
      const err = await indexer.download(rootHash, outputPath, true);
      
      if (err !== null) {
        throw new Error(`Download error: ${err}`);
      }

      console.log('Download successful!');
      console.log('File saved to:', outputPath);
    } catch (error) {
      console.error('Download error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('config')
  .description('Show current configuration')
  .action(() => {
    console.log('\nNetwork Configuration:');
    console.log('---------------------');
    console.log('RPC URL:', RPC_URL);
    console.log('Flow Contract:', FLOW_CONTRACT_STANDARD);
    console.log('Indexer RPC:', INDEXER_RPC);
    console.log('\nCommand Usage:');
    console.log('-------------');
    console.log('Add -k or --key option with your private key when running commands');
    console.log('Example: npm start -- -k YOUR_PRIVATE_KEY upload ./file.txt');
  });

program.parse();