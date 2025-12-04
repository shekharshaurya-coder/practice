const https = require('https');
const http = require('http');

async function makeRequest(method, path, body = null, token = null) {
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

async function test() {
  try {
    console.log('🔑 1. Logging in as shekxyy...');
    const loginRes = await makeRequest('POST', '/api/auth/login', { username: 'shekxyy', password: '123456' });
    if (loginRes.status !== 200) {
      console.log('   ❌ Login failed:', loginRes.body);
      return;
    }
    const token = loginRes.body.token;
    console.log('✅ Login successful\n');

    console.log('📝 2. Creating a post...');
    const postRes = await makeRequest('POST', '/api/posts', 
      { content: 'Test post for logging verification ' + new Date().toISOString() },
      token
    );
    if (postRes.status !== 201) {
      console.log('   ❌ Post creation failed:', postRes.body);
      return;
    }
    const postId = postRes.body._id;
    console.log('✅ Post created:', postId);
    console.log('   ⏳ Waiting 2 seconds for log to be sent...\n');
    
    await new Promise(r => setTimeout(r, 2000));

    console.log('❤️  3. Liking the post...');
    const likeRes = await makeRequest('POST', `/api/posts/${postId}/like`, {}, token);
    if (likeRes.status !== 200) {
      console.log('   ❌ Like failed:', likeRes.body);
      return;
    }
    console.log('✅ Post liked');
    console.log('   ⏳ Waiting 2 seconds for log to be sent...\n');
    
    await new Promise(r => setTimeout(r, 2000));

    console.log('💬 4. Adding a comment...');
    const commentRes = await makeRequest('POST', `/api/posts/${postId}/comments`,
      { comment: 'Test comment for logging verification' },
      token
    );
    if (commentRes.status !== 201) {
      console.log('   ❌ Comment failed:', commentRes.body);
      return;
    }
    console.log('✅ Comment added');
    console.log('   ⏳ Waiting 2 seconds for logs to be sent...\n');
    
    await new Promise(r => setTimeout(r, 2000));

    console.log('📊 5. Checking admin logs...');
    const logsRes = await makeRequest('GET', '/api/admin/logs?eventType=POST_CREATED&username=shekxyy', null, token);
    console.log(`   Found ${logsRes.body.length} POST_CREATED logs for shekxyy`);
    if (logsRes.body.length > 0) {
      console.log('   ✅ Latest log:', JSON.stringify(logsRes.body[0], null, 2));
    }

    console.log('\n✅ ALL TESTS COMPLETED!');
  } catch (err) {
    console.error('Test error:', err.message);
  }
}

test();
