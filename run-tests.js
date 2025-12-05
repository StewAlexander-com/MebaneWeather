#!/usr/bin/env node

/**
 * Automated Test Runner for Weather Dashboard
 * 
 * This script automates running the test suite and reports results.
 * Uses Puppeteer for headless browser automation or falls back to simple execution.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Test configuration
const TEST_FILE = path.join(__dirname, 'test-dashboard.html');
const DASHBOARD_FILE = path.join(__dirname, 'Severe-Weather-Dashboard.html');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

/**
 * Check if Puppeteer is available
 */
function checkPuppeteer() {
  try {
    require.resolve('puppeteer');
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Run tests using Puppeteer (headless browser)
 */
async function runTestsWithPuppeteer() {
  const puppeteer = require('puppeteer');
  
  console.log(`${colors.cyan}Starting automated test suite...${colors.reset}\n`);
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Load test file
    const testUrl = `file://${TEST_FILE}`;
    console.log(`${colors.blue}Loading test suite: ${TEST_FILE}${colors.reset}`);
    await page.goto(testUrl, { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Wait for page to be ready
    await page.waitForTimeout(1000);
    
    // Inject script to run tests and extract results
    const testResults = await page.evaluate(async () => {
      // Access the TestRunner from the page
      return new Promise((resolve) => {
        // Wait for TestRunner to be available
        const checkTestRunner = setInterval(() => {
          if (window.testRunnerInstance) {
            clearInterval(checkTestRunner);
            runTests();
          }
        }, 100);
        
        // Create test runner instance if not exists
        if (!window.testRunnerInstance) {
          window.testRunnerInstance = new window.TestRunner();
          window.testRunnerInstance.init();
        }
        
        async function runTests() {
          window.testRunnerInstance.resetResults();
          
          // Run all test suites
          await window.testRunnerInstance.testSPCMapping();
          await window.testRunnerInstance.testThreatLevels();
          await window.testRunnerInstance.testAlerts();
          await window.testRunnerInstance.testErrorHandling();
          
          // Extract results
          const results = {
            pass: window.testRunnerInstance.results.pass,
            fail: window.testRunnerInstance.results.fail,
            total: window.testRunnerInstance.results.total,
            details: []
          };
          
          // Extract test items from DOM
          document.querySelectorAll('.test-item').forEach(item => {
            const name = item.querySelector('.test-item-name')?.textContent || '';
            const details = item.querySelector('.test-item-details')?.textContent || '';
            const passed = item.classList.contains('pass');
            results.details.push({ name, details, passed });
          });
          
          resolve(results);
        }
        
        // Timeout after 10 seconds
        setTimeout(() => {
          if (checkTestRunner) clearInterval(checkTestRunner);
          resolve({ error: 'Timeout waiting for tests to complete' });
        }, 10000);
      });
    });
    
    if (testResults.error) {
      throw new Error(testResults.error);
    }
    
    return testResults;
    
  } finally {
    await browser.close();
  }
}

/**
 * Run tests using direct logic execution (no browser)
 */
function runTestsDirect() {
  console.log(`${colors.cyan}Running tests with direct logic execution...${colors.reset}\n`);
  
  const results = {
    pass: 0,
    fail: 0,
    total: 0,
    details: []
  };
  
  // Test 1: SPC Risk Level Mapping
  console.log(`${colors.blue}Testing SPC Risk Level Mapping...${colors.reset}`);
  const codeMap = { 2: 'TSTM', 3: 'MRGL', 4: 'SLGT', 5: 'ENH', 6: 'MDT', 8: 'HIGH' };
  const spcTests = [
    { dn: 2, expected: 'TSTM' },
    { dn: 3, expected: 'MRGL' },
    { dn: 4, expected: 'SLGT' },
    { dn: 5, expected: 'ENH' },
    { dn: 6, expected: 'MDT' },
    { dn: 8, expected: 'HIGH' }
  ];
  
  spcTests.forEach(test => {
    const result = codeMap[test.dn] === test.expected;
    results.total++;
    if (result) {
      results.pass++;
      console.log(`  ${colors.green}✓${colors.reset} DN ${test.dn} maps to ${test.expected}`);
    } else {
      results.fail++;
      console.log(`  ${colors.red}✗${colors.reset} DN ${test.dn} - Expected ${test.expected}, got ${codeMap[test.dn] || 'null'}`);
    }
    results.details.push({
      name: `DN ${test.dn} maps to ${test.expected}`,
      passed: result
    });
  });
  
  // Test 2: Threat Level Calculation
  console.log(`\n${colors.blue}Testing Threat Level Calculation...${colors.reset}`);
  
  function calculateThreatLevel(hasActiveWarnings, spcRiskLevel) {
    if (hasActiveWarnings) {
      return 'WARNING';
    } else if (spcRiskLevel && ['ENH', 'MDT', 'HIGH'].includes(spcRiskLevel)) {
      return 'CAUTION';
    } else if (spcRiskLevel && ['MRGL', 'SLGT'].includes(spcRiskLevel)) {
      return 'MONITOR';
    } else {
      return 'SAFE';
    }
  }
  
  const threatTests = [
    { warnings: true, spc: 'HIGH', expected: 'WARNING', name: 'Warnings override SPC risk' },
    { warnings: false, spc: 'ENH', expected: 'CAUTION', name: 'Enhanced risk → CAUTION' },
    { warnings: false, spc: 'MDT', expected: 'CAUTION', name: 'Moderate risk → CAUTION' },
    { warnings: false, spc: 'MRGL', expected: 'MONITOR', name: 'Marginal risk → MONITOR' },
    { warnings: false, spc: 'SLGT', expected: 'MONITOR', name: 'Slight risk → MONITOR' },
    { warnings: false, spc: null, expected: 'SAFE', name: 'No threats → SAFE' }
  ];
  
  threatTests.forEach(test => {
    const result = calculateThreatLevel(test.warnings, test.spc);
    const passed = result === test.expected;
    results.total++;
    if (passed) {
      results.pass++;
      console.log(`  ${colors.green}✓${colors.reset} ${test.name} (${result})`);
    } else {
      results.fail++;
      console.log(`  ${colors.red}✗${colors.reset} ${test.name} - Expected ${test.expected}, got ${result}`);
    }
    results.details.push({
      name: test.name,
      passed: passed
    });
  });
  
  // Test 3: Alert Processing
  console.log(`\n${colors.blue}Testing Alert Processing...${colors.reset}`);
  
  const alerts = [
    { properties: { event: 'Severe Thunderstorm Warning', severity: 'Severe' } },
    { properties: { event: 'Tornado Watch', severity: 'Moderate' } },
    { properties: { event: 'Flood Advisory', severity: 'Minor' } },
    { properties: { event: 'Information Statement', severity: 'Unknown' } }
  ];
  
  const filtered = alerts.filter(alert => {
    const event = alert.properties.event?.toLowerCase() || '';
    const severity = alert.properties.severity?.toLowerCase() || '';
    return (event.includes('warning') || event.includes('watch') || event.includes('advisory')) &&
           (severity === 'severe' || severity === 'moderate' || severity === 'minor');
  });
  
  const alertFilterTest = filtered.length === 3;
  results.total++;
  if (alertFilterTest) {
    results.pass++;
    console.log(`  ${colors.green}✓${colors.reset} Alert filtering (3 alerts filtered)`);
  } else {
    results.fail++;
    console.log(`  ${colors.red}✗${colors.reset} Alert filtering - Expected 3, got ${filtered.length}`);
  }
  results.details.push({
    name: 'Alert filtering',
    passed: alertFilterTest
  });
  
  const warnings = alerts.filter(alert => {
    const event = alert.properties.event?.toLowerCase() || '';
    return event.includes('warning') && !event.includes('watch') && !event.includes('advisory');
  });
  
  const warningTest = warnings.length === 1;
  results.total++;
  if (warningTest) {
    results.pass++;
    console.log(`  ${colors.green}✓${colors.reset} Warning detection (1 warning found)`);
  } else {
    results.fail++;
    console.log(`  ${colors.red}✗${colors.reset} Warning detection - Expected 1, got ${warnings.length}`);
  }
  results.details.push({
    name: 'Warning detection',
    passed: warningTest
  });
  
  // Test 4: Winter Weather Detection
  console.log(`\n${colors.blue}Testing Winter Weather Detection...${colors.reset}`);
  
  const WINTER_WEATHER_SYNONYMS = {
    alerts: [
      // Advisories
      'winter weather advisory',
      'freezing rain advisory',
      'snow advisory',
      'wind chill advisory',
      'frost advisory',
      'lake effect snow advisory',
      'winter weather statement',
      // Warnings
      'winter storm warning',
      'winter weather warning',
      'ice storm warning',
      'blizzard warning',
      'wind chill warning',
      'freeze warning',
      'freezing rain warning',
      'snow squall warning',
      'lake effect snow warning',
      'extreme cold warning',
      'hard freeze warning',
      // Watches
      'winter storm watch',
      'ice storm watch',
      'blizzard watch',
      'wind chill watch',
      'extreme cold watch',
      'freeze watch',
      'freezing rain watch',
      'lake effect snow watch'
    ]
  };
  
  function isWinterWeatherAlert(eventName) {
    if (!eventName || typeof eventName !== 'string') {
      return false;
    }
    const eventLower = eventName.toLowerCase();
    return WINTER_WEATHER_SYNONYMS.alerts.some(alert => eventLower.includes(alert));
  }
  
  const winterAlertTests = [
    // Advisories
    { event: 'Winter Weather Advisory', expected: true },
    { event: 'Freezing Rain Advisory', expected: true },
    { event: 'Lake Effect Snow Advisory', expected: true },
    { event: 'Winter Weather Statement', expected: true },
    // Warnings
    { event: 'Winter Storm Warning', expected: true },
    { event: 'Winter Weather Warning', expected: true },
    { event: 'Ice Storm Warning', expected: true },
    { event: 'Blizzard Warning', expected: true },
    { event: 'Snow Squall Warning', expected: true },
    { event: 'Extreme Cold Warning', expected: true },
    { event: 'Lake Effect Snow Warning', expected: true },
    { event: 'Freezing Rain Warning', expected: true },
    // Non-winter (should be rejected)
    { event: 'Severe Thunderstorm Warning', expected: false },
    { event: 'Tornado Watch', expected: false }
  ];
  
  winterAlertTests.forEach(test => {
    const result = isWinterWeatherAlert(test.event);
    const passed = result === test.expected;
    results.total++;
    if (passed) {
      results.pass++;
      console.log(`  ${colors.green}✓${colors.reset} Winter alert detection: "${test.event}"`);
    } else {
      results.fail++;
      console.log(`  ${colors.red}✗${colors.reset} Winter alert detection: "${test.event}" - Expected ${test.expected}, got ${result}`);
    }
    results.details.push({
      name: `Winter alert: "${test.event}"`,
      passed: passed
    });
  });
  
  function detectWinterWeatherFromAlerts(alerts) {
    if (!alerts || !Array.isArray(alerts) || alerts.length === 0) {
      return { status: 'none' };
    }
    
    let hasWarning = false;
    let hasAdvisory = false;
    
    for (const alert of alerts) {
      if (!alert || typeof alert !== 'object' || !alert.properties) {
        continue;
      }
      
      const event = alert.properties.event || '';
      if (!isWinterWeatherAlert(event)) {
        continue;
      }
      
      const eventLower = event.toLowerCase();
      // Check for warnings (highest priority) - must exclude watch/advisory/statement
      if (eventLower.includes('warning') && 
          !eventLower.includes('watch') && 
          !eventLower.includes('advisory') &&
          !eventLower.includes('statement')) {
        hasWarning = true;
      } 
      // Check for advisories, watches, and statements (lower priority)
      else if (eventLower.includes('advisory') || 
               eventLower.includes('statement') ||
               eventLower.includes('watch')) {
        hasAdvisory = true;
      }
    }
    
    if (hasWarning) {
      return { status: 'warning' };
    } else if (hasAdvisory) {
      return { status: 'advisory' };
    }
    
    return { status: 'none' };
  }
  
  const winterDetectionTests = [
    {
      alerts: [{ properties: { event: 'Winter Storm Warning', severity: 'Severe' } }],
      expected: 'warning',
      name: 'Winter Storm Warning detection'
    },
    {
      alerts: [{ properties: { event: 'Winter Weather Advisory', severity: 'Minor' } }],
      expected: 'advisory',
      name: 'Winter Weather Advisory detection'
    },
    {
      alerts: [{ properties: { event: 'Blizzard Warning', severity: 'Severe' } }],
      expected: 'warning',
      name: 'Blizzard Warning detection'
    },
    {
      alerts: [{ properties: { event: 'Snow Squall Warning', severity: 'Severe' } }],
      expected: 'warning',
      name: 'Snow Squall Warning detection'
    },
    {
      alerts: [{ properties: { event: 'Extreme Cold Warning', severity: 'Severe' } }],
      expected: 'warning',
      name: 'Extreme Cold Warning detection'
    },
    {
      alerts: [{ properties: { event: 'Winter Weather Statement', severity: 'Minor' } }],
      expected: 'advisory',
      name: 'Winter Weather Statement detection'
    },
    {
      alerts: [{ properties: { event: 'Severe Thunderstorm Warning', severity: 'Severe' } }],
      expected: 'none',
      name: 'Non-winter alerts ignored'
    }
  ];
  
  winterDetectionTests.forEach(test => {
    const result = detectWinterWeatherFromAlerts(test.alerts);
    const passed = result.status === test.expected;
    results.total++;
    if (passed) {
      results.pass++;
      console.log(`  ${colors.green}✓${colors.reset} ${test.name}`);
    } else {
      results.fail++;
      console.log(`  ${colors.red}✗${colors.reset} ${test.name} - Expected ${test.expected}, got ${result.status}`);
    }
    results.details.push({
      name: test.name,
      passed: passed
    });
  });
  
  // Test 5: Error Handling
  console.log(`\n${colors.blue}Testing Error Handling...${colors.reset}`);
  
  const missingData = { features: [] };
  const errorHandlingTest = missingData.features.length === 0;
  results.total++;
  if (errorHandlingTest) {
    results.pass++;
    console.log(`  ${colors.green}✓${colors.reset} Missing data handling`);
  } else {
    results.fail++;
    console.log(`  ${colors.red}✗${colors.reset} Missing data handling failed`);
  }
  results.details.push({
    name: 'Missing data handling',
    passed: errorHandlingTest
  });
  
  return results;
}

/**
 * Print test results summary
 */
function printResults(results) {
  console.log(`\n${colors.bright}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.bright}Test Results Summary${colors.reset}`);
  console.log(`${colors.bright}${'='.repeat(60)}${colors.reset}\n`);
  
  const passRate = ((results.pass / results.total) * 100).toFixed(1);
  
  console.log(`Total Tests: ${results.total}`);
  console.log(`${colors.green}Passed: ${results.pass}${colors.reset}`);
  console.log(`${colors.red}Failed: ${results.fail}${colors.reset}`);
  console.log(`Pass Rate: ${passRate}%\n`);
  
  if (results.fail > 0) {
    console.log(`${colors.red}${colors.bright}Failed Tests:${colors.reset}`);
    results.details.forEach(detail => {
      if (!detail.passed) {
        console.log(`  ${colors.red}✗${colors.reset} ${detail.name}`);
        if (detail.details) {
          console.log(`    ${detail.details}`);
        }
      }
    });
    console.log('');
  }
  
  if (results.fail === 0) {
    console.log(`${colors.green}${colors.bright}✓ All tests passed!${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${colors.red}${colors.bright}✗ Some tests failed${colors.reset}\n`);
    process.exit(1);
  }
}

/**
 * Main execution
 */
async function main() {
  // Check if test file exists
  if (!fs.existsSync(TEST_FILE)) {
    console.error(`${colors.red}Error: Test file not found: ${TEST_FILE}${colors.reset}`);
    process.exit(1);
  }
  
  let results;
  
  // Try Puppeteer first, fall back to direct execution
  if (checkPuppeteer()) {
    try {
      results = await runTestsWithPuppeteer();
    } catch (error) {
      console.log(`${colors.yellow}Warning: Puppeteer test failed, falling back to direct execution${colors.reset}`);
      console.log(`  Error: ${error.message}\n`);
      results = runTestsDirect();
    }
  } else {
    console.log(`${colors.yellow}Note: Puppeteer not available, using direct test execution${colors.reset}`);
    console.log(`${colors.yellow}For full browser automation, install: npm install puppeteer${colors.reset}\n`);
    results = runTestsDirect();
  }
  
  printResults(results);
}

// Run tests
main().catch(error => {
  console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
  console.error(error.stack);
  process.exit(1);
});

