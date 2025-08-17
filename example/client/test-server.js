// Comprehensive test script to check server connectivity and client proxy
const testServer = async () => {
  console.log("🧪 Testing server connectivity and client proxy...\n");

  try {
    // Test 1: Basic server connectivity
    console.log("1️⃣ Testing basic server connectivity...");
    const response = await fetch("http://localhost:3000/api/app/test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: "test-connection" }),
    });

    console.log("📊 Status:", response.status);
    console.log("📋 Headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.log("❌ Error response:", errorText);
    } else {
      const result = await response.text();
      console.log("✅ Success:", result);
    }
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
    console.log("\n💡 Possible solutions:");
    console.log(
      "1. Make sure the server is running: cd example/server && pnpm start"
    );
    console.log("2. Check if the server is on port 3000");
    console.log("3. Verify the API prefix is /api");
    return;
  }

  try {
    // Test 2: CORS preflight
    console.log("\n2️⃣ Testing CORS preflight...");
    const preflightResponse = await fetch(
      "http://localhost:3000/api/app/test",
      {
        method: "OPTIONS",
        headers: {
          Origin: "http://localhost:5174", // Note: client is now on 5174
          "Access-Control-Request-Method": "POST",
          "Access-Control-Request-Headers": "Content-Type",
        },
      }
    );

    console.log("📊 Status:", preflightResponse.status);
    console.log("📋 CORS Headers:");
    console.log(
      "   Access-Control-Allow-Origin:",
      preflightResponse.headers.get("Access-Control-Allow-Origin")
    );
    console.log(
      "   Access-Control-Allow-Methods:",
      preflightResponse.headers.get("Access-Control-Allow-Methods")
    );
    console.log(
      "   Access-Control-Allow-Headers:",
      preflightResponse.headers.get("Access-Control-Allow-Headers")
    );
  } catch (error) {
    console.error("❌ CORS preflight failed:", error.message);
  }

  console.log("\n🎉 Server connectivity test complete!");

  // Test 3: Test the actual client proxy
  try {
    console.log("\n3️⃣ Testing client proxy...");

    // Import the client (this will work in Node.js)
    const { createRpcClient } = await import(
      "../../packages/client/dist/esm/index.mjs"
    );

    const client = createRpcClient({
      baseUrl: "http://localhost:3000",
      apiPrefix: "/api",
    });

    console.log("✅ Client created successfully");
    console.log("📡 Testing client.app.test()...");

    // Test calling the method
    const result = await client.app.test({ id: "hello-from-proxy" });
    console.log("✅ Proxy call successful!");
    console.log("📤 Result:", result);
  } catch (error) {
    console.error("❌ Client proxy test failed:", error.message);
    console.log("\n🔍 Error details:", error);
  }

  // Test 4: Test different request formats
  try {
    console.log("\n4️⃣ Testing different request formats...");

    // Test with no body
    console.log("\n📤 Testing with no body...");
    const responseNoBody = await fetch("http://localhost:3000/api/app/test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("📊 Status (no body):", responseNoBody.status);
    if (responseNoBody.ok) {
      const result = await responseNoBody.text();
      console.log("✅ Result (no body):", result);
    }

    // Test with string body (this might fail due to JSON parsing)
    console.log("\n📤 Testing with string body (direct fetch)...");
    try {
      const responseString = await fetch("http://localhost:3000/api/app/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify("test-string"),
      });

      console.log("📊 Status (string body):", responseString.status);
      if (responseString.ok) {
        const result = await responseString.text();
        console.log("✅ Result (string body):", result);
      } else {
        const error = await responseString.text();
        console.log("❌ Error (string body):", error);
      }
    } catch (error) {
      console.log("❌ String body test failed:", error.message);
    }

    // Test 5: Test client proxy with string bodies
    console.log("\n5️⃣ Testing client proxy with string bodies...");
    try {
      const { createRpcClient } = await import(
        "../../packages/client/dist/esm/index.mjs"
      );

      const client = createRpcClient({
        baseUrl: "http://localhost:3000",
        apiPrefix: "/api",
      });

      // Test with string (should auto-wrap to { value: "hello-string" })
      console.log('\n📤 Testing client.app.test("hello-string")...');
      const resultString = await client.app.test("hello-string");
      console.log("✅ String result:", resultString);

      // Test with object (should work as before)
      console.log('\n📤 Testing client.app.test({ id: "hello-object" })...');
      const resultObject = await client.app.test({ id: "hello-object" });
      console.log("✅ Object result:", resultObject);

      // Test with no arguments (should work as before)
      console.log("\n📤 Testing client.app.test()...");
      const resultNone = await client.app.test();
      console.log("✅ No args result:", resultNone);

      // Test 6: Test infinite nested routes
      console.log("\n6️⃣ Testing infinite nested routes...");

      // Test client.rout.route2.test() - this should work now!
      console.log(
        '\n📤 Testing client.rout.route2.test({ id: "nested-test" })...'
      );
      try {
        const nestedResult = await client.rout.route2.test({
          id: "nested-test",
        });
        console.log("✅ Nested route result:", nestedResult);
      } catch (error) {
        console.log("❌ Nested route failed:", error.message);
      }

      // Test even deeper nesting (if it exists)
      console.log("\n📤 Testing deeper nesting (if exists)...");
      try {
        // This would test something like client.rout.route2.subroute.method()
        // but we don't have that in the current config
        console.log("ℹ️  No deeper routes configured in current server setup");
      } catch (error) {
        console.log("❌ Deep nesting test failed:", error.message);
      }
    } catch (error) {
      console.log("❌ Client proxy string tests failed:", error.message);
    }
  } catch (error) {
    console.error("❌ Request format tests failed:", error.message);
  }
};

// Run the test
testServer();
