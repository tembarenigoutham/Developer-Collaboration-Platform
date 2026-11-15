import http from 'http';

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (_) {
          resolve({ status: res.statusCode, text: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTestSuite() {
  console.log('====================================================');
  console.log('🧪 DevCollab Backend API Verification Suite');
  console.log('====================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, detail = '') {
    if (condition) {
      console.log(` ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(` ❌ FAIL: ${testName} ${detail ? '(' + detail + ')' : ''}`);
      failed++;
    }
  }

  // 1. Health check
  try {
    const health = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/health',
      method: 'GET'
    });
    assert(health.status === 200 && health.data?.database === 'connected', 'Health Check & DB Connection');
  } catch (err) {
    assert(false, 'Health Check & DB Connection', err.message);
  }

  // 2. Authentication: Login
  let token = null;
  let user = null;
  try {
    const loginPayload = JSON.stringify({ email: 'rgoutham079@gmail.com', password: 'password123' });
    const loginRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(loginPayload) }
    }, loginPayload);

    token = loginRes.data?.data?.token;
    user = loginRes.data?.data?.user;
    assert(loginRes.status === 200 && !!token, 'User Authentication (JWT Token Generation)');
  } catch (err) {
    assert(false, 'User Authentication', err.message);
  }

  if (!token) {
    console.error('Fatal: Cannot continue tests without auth token.');
    process.exit(1);
  }

  const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  // 3. User Profile
  try {
    const profileRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/profile',
      method: 'GET',
      headers: authHeaders
    });
    assert(profileRes.status === 200 && profileRes.data?.data?.email === 'rgoutham079@gmail.com', 'Get User Profile & Metrics');
  } catch (err) {
    assert(false, 'Get User Profile', err.message);
  }

  // 4. Dashboard Stats
  try {
    const statsRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/dashboard/stats',
      method: 'GET',
      headers: authHeaders
    });
    assert(statsRes.status === 200 && statsRes.data?.data?.stats !== undefined, 'Dashboard Aggregated Stats');
  } catch (err) {
    assert(false, 'Dashboard Stats', err.message);
  }

  // 5. Projects
  let testProjectId = 1;
  try {
    const projRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/projects',
      method: 'GET',
      headers: authHeaders
    });
    assert(projRes.status === 200 && Array.isArray(projRes.data?.data), 'List Workspaces/Projects');
    if (projRes.data?.data?.length > 0) testProjectId = projRes.data.data[0].id;
  } catch (err) {
    assert(false, 'List Projects', err.message);
  }

  // 6. Project Tasks
  try {
    const taskRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/api/projects/${testProjectId}/tasks`,
      method: 'GET',
      headers: authHeaders
    });
    assert(taskRes.status === 200 && Array.isArray(taskRes.data?.data), 'List Project Tasks (Kanban)');
  } catch (err) {
    assert(false, 'List Project Tasks', err.message);
  }

  // 7. Project Issues
  try {
    const issueRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/api/projects/${testProjectId}/issues`,
      method: 'GET',
      headers: authHeaders
    });
    assert(issueRes.status === 200 && Array.isArray(issueRes.data?.data), 'List Project Issues & Bug Tracker');
  } catch (err) {
    assert(false, 'List Project Issues', err.message);
  }

  // 8. Project Reviews
  try {
    const revRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/api/projects/${testProjectId}/reviews`,
      method: 'GET',
      headers: authHeaders
    });
    assert(revRes.status === 200 && Array.isArray(revRes.data?.data), 'List Code Reviews & Pull Requests');
  } catch (err) {
    assert(false, 'List Code Reviews', err.message);
  }

  // 9. AI Documentation Generator
  try {
    const aiPayload = JSON.stringify({ project_id: testProjectId });
    const aiRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/ai/generate-readme',
      method: 'POST',
      headers: { ...authHeaders, 'Content-Length': Buffer.byteLength(aiPayload) }
    }, aiPayload);
    assert(aiRes.status === 200 && !!aiRes.data?.data?.content, 'AI Documentation Synthesis (README.md)');
  } catch (err) {
    assert(false, 'AI Documentation Synthesis', err.message);
  }

  // 10. Notifications
  try {
    const notifRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/notifications',
      method: 'GET',
      headers: authHeaders
    });
    assert(notifRes.status === 200 && Array.isArray(notifRes.data?.data), 'Notifications Query & Unread Counter');
  } catch (err) {
    assert(false, 'Notifications', err.message);
  }

  console.log('====================================================');
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) process.exit(1);
  else process.exit(0);
}

runTestSuite().catch(err => {
  console.error('Test suite error:', err);
  process.exit(1);
});
