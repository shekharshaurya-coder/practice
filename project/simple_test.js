#!/usr/bin/env node
const http = require('http');

let token = '';

function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  try {
    console.log('1. Logging in...');
    let res = await request('POST', '/api/auth/login', { username: 'shekxyy', password: '123456' });
    if (res.status !== 200) throw new Error('Login failed');
    token = res.body.token;
    console.log('   ✅ Logged in\n');

    console.log('2. Creating post...');
    res = await request('POST', '/api/posts', { content: 'Test: ' + Date.now() });
    if (res.status !== 201) throw new Error('Post failed: ' + res.status);
    const postId = res.body.id || res.body._id;
    console.log('   ✅ Post created:', postId);
    await new Promise(r => setTimeout(r, 1500));

    console.log('\n3. Liking post...');
    res = await request('POST', `/api/posts/${postId}/like`, {});
    if (res.status !== 200) throw new Error('Like failed');
    console.log('   ✅ Post liked');
    await new Promise(r => setTimeout(r, 1500));

    console.log('\n4. Adding comment...');
    res = await request('POST', `/api/posts/${postId}/comments`, { comment: 'Test comment' });
    if (res.status !== 201) throw new Error('Comment failed');
    console.log('   ✅ Comment added');
    await new Promise(r => setTimeout(r, 1500));

    console.log('\n5. Fetching admin logs...');
    res = await request('GET', '/api/admin/logs?eventType=POST_CREATED&username=shekxyy', null);
    console.log(`   ✅ Found ${res.body.length} POST_CREATED logs`);
    if (res.body.length > 0) {
      console.log('   Latest:', JSON.stringify(res.body[0], null, 2));
    }
    
    console.log('\n✅ TEST COMPLETE');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

run();
