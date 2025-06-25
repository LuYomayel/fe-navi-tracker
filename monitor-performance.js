#!/usr/bin/env node

// Script para monitorear el rendimiento del backend
const BACKEND_URL = "http://localhost:3001/api/activities";
const FRONTEND_URL = "http://localhost:3000/api/activities";

async function testEndpoint(url, name) {
  const start = Date.now();

  try {
    const response = await fetch(url);
    const duration = Date.now() - start;
    const status = response.status;

    console.log(`${name}: ${status} - ${duration}ms`);

    if (duration > 5000) {
      console.warn(`⚠️  ${name} tardó más de 5 segundos!`);
    }

    return { success: response.ok, duration, status };
  } catch (error) {
    const duration = Date.now() - start;
    console.error(`❌ ${name}: Error - ${duration}ms`, error.message);
    return { success: false, duration, error: error.message };
  }
}

async function runTests() {
  console.log("🔍 Monitoreando rendimiento...\n");

  const tests = [
    { url: BACKEND_URL, name: "Backend directo" },
    { url: FRONTEND_URL, name: "Frontend proxy" },
  ];

  for (let i = 0; i < 5; i++) {
    console.log(`--- Test ${i + 1} ---`);

    for (const test of tests) {
      await testEndpoint(test.url, test.name);
    }

    console.log("");

    // Esperar 2 segundos entre tests
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}

runTests().catch(console.error);
