import { Buffer } from 'buffer';
import Process from 'process';
globalThis.process = Process;
globalThis.Buffer = Buffer;
document.title = import.meta.env.VITE_APPLICATION_NAME;
