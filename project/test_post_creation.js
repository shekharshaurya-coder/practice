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
    console.log('1️⃣  Logging in...');
    const loginRes = await makeRequest('POST', '/api/auth/login', { username: 'shekxyy', password: '123456' });
    console.log('   Status:', loginRes.status);
    if (loginRes.status !== 200) {
      console.log('   Error:', loginRes.body);
      return;
    }
    
    const token = loginRes.body.token;
    console.log('✅ Login successful. Token:', token.substring(0, 30) + '...\n');

    console.log('2️⃣  Creating a post...');
    const postRes = await makeRequest('POST', '/api/posts', 
      { content: 'Test post ' + Date.now(), type: 'text' }, 
      token
    );
    console.log('   Status:', postRes.status);
    console.log('   Response:', JSON.stringify(postRes.body, null, 2));
    
    if (postRes.status === 201) {
      console.log('✅ Post created successfully!');
    } else {
      console.log('❌ Post creation failed');
    }
  } catch (err) {
    console.error('Test error:', err);
  }
}

test();
