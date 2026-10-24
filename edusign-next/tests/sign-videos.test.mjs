import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { tutorChatSchema, voiceChatSchema } from '../src/lib/tutor-validation.mjs';
const read = async path => JSON.parse(await readFile(new URL(path, import.meta.url)));
const project = await read('../src/lib/data/project-sign-videos.json');
const lsf = await read('../src/lib/data/sign-videos.json');
test('imported videos retain distinct identity, provenance and private storage paths', () => {
 assert.equal(project.length,354);
 assert.equal(new Set(project.map(x=>x.id)).size,354);
 for(const item of project) {
  assert.equal(item.language,'unverified');
  assert.equal(item.storage.bucket,'sign-demonstrations');
  assert.ok(item.storage.path.endsWith(item.mp4sha256+'.mp4'));
  assert.ok(item.storage.originalPath.endsWith(item.sha256+'.webm'));
  assert.equal(item.src,`/api/signs/${item.id}/video`);
  for(const language of ['fr','en']) assert.ok(item.label[language] && item.parentTip[language]);
 }
});
test('sourced LSF clips preserve credits and playable local copies', async () => {
 for(const item of lsf) {
  assert.equal(item.language,'LSF');
  assert.equal(item.license,'CC BY-SA 4.0');
  assert.ok(item.sourceUrl.startsWith('https://commons.wikimedia.org/wiki/File:'));
  for(const src of [item.src,item.originalSrc]) assert.ok((await readFile(new URL('../public'+src,import.meta.url))).length>1000);
 }
});
test('text and voice accept the same bounded sign lookup options', () => {
 for(const schema of [tutorChatSchema,voiceChatSchema]) {
  const body={message:'hi',audio:'YQ==',intent:'sign',collection:'project',language:'en'};
  assert.equal(schema.parse(body).collection,'project');
  assert.equal(schema.safeParse({...body,collection:'../private'}).success,false);
  assert.equal(schema.safeParse({...body,intent:'admin'}).success,false);
 }
});
