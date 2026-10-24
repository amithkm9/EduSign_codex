import { createClient } from '@supabase/supabase-js';
import { supabaseConfig, safeError } from './env.mjs';
const { url, secret } = supabaseConfig();
const client = createClient(url, secret, {auth:{persistSession:false,autoRefreshToken:false}});
try {
 const {data,error}=await client.storage.listBuckets();
 if(error) throw error;
 console.log(JSON.stringify(data.map(({name,public:isPublic,file_size_limit})=>({name,public:isPublic,file_size_limit})),null,2));
} catch(error){console.error('Storage check failed:',safeError(error));process.exitCode=1;}
