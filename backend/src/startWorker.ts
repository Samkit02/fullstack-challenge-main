import { redis } from './queue/worker.js';
import { spawn } from 'child_process';

const client = redis;

client.on('error', async (err: any) => {
  console.log('Redis is not running, starting Redis server...', err.message);

  const redisServer = spawn('redis-server');

  redisServer.stdout.on('data', (data: any) => {
    console.log(`Redis server output: ${data}`);
  });

  redisServer.stderr.on('data', (data: any) => {
    console.error(`Redis server error: ${data}`);
  });

  redisServer.on('close', (code: any) => {
    if (code === 0) {
      console.log('Redis server started successfully.');
      startWorker();
    } else {
      console.error(`Redis server failed with code ${code}`);
    }
  });
});

client.on('ready', () => {
  console.log('Redis is already running.');
  startWorker();
});

function startWorker() {
  console.log('Starting the worker...');

  const workerProcess = spawn('tsx', ['src/queue/worker.ts'], { stdio: 'inherit' });

  workerProcess.on('close', (code: any) => {
    console.log(`Worker process exited with code ${code}`);
    client.quit(); 
  });
}