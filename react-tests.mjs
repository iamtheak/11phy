import {build} from 'esbuild';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
fs.mkdirSync('.qa',{recursive:true});
await build({entryPoints:['app.jsx'],bundle:true,platform:'node',format:'esm',jsx:'automatic',packages:'external',outfile:'.qa/app-runtime.mjs'});
await build({external:['./app-runtime.mjs'],entryPoints:['react-tests.jsx'],bundle:true,platform:'node',format:'esm',jsx:'automatic',packages:'external',outfile:'.qa/react-tests.mjs'});
const r=spawnSync(process.execPath,['.qa/react-tests.mjs'],{stdio:'inherit'});process.exit(r.status??1);
