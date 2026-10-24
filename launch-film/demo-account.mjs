import { readFile, writeFile, unlink } from 'node:fs/promises';
import { randomBytes, randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
const require=createRequire(new URL('../edusign-next/package.json',import.meta.url));
const {createClient}=require('@supabase/supabase-js');
import { supabaseConfig } from '../edusign-next/scripts/env.mjs';
if (!process.argv.includes('--temporary-user')) throw new Error('Pass --temporary-user');
const {url,secret}=supabaseConfig();
const admin=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
const file=new URL('./.demo-session.json',import.meta.url);
if (process.argv.includes('--cleanup')) {
  const {id}=JSON.parse(await readFile(file,'utf8'));
  const {error}=await admin.auth.admin.deleteUser(id);
  if(error) throw new Error('Demo cleanup failed');
  await unlink(file);
  console.log('Temporary launch-demo account removed.');
} else {
  const email=`edusign-film-${randomUUID()}@example.com`;
  const password=`Demo9!${randomBytes(24).toString('base64url')}`;
  const {data,error}=await admin.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{name:'EduSign Demo',user_type:'parent',edusign_test:true}});
  if(error) throw new Error('Demo account creation failed');
  await writeFile(file,JSON.stringify({id:data.user.id,email,password}),{mode:0o600,flag:'wx'});
  console.log('Temporary demo account ready; credentials stored privately, not printed.');
}
