import './lib/styles/main.scss';
import App from './App.svelte';

// console.log('main.ts loaded');

const target = document.getElementById('app');

if (!target) {
  throw new Error("Element with id 'app' not found");
}

// console.log('Creating App...');

const app = new App({
  target,
});

// console.log('App created successfully');

export default app;
