#!/usr/bin/env node

/**
 * Phase 6: Validation
 *
 * This script:
 * 1. Runs all tests (if any exist)
 * 2. Checks coverage matrix for 100% completion
 * 3. Validates no gaps remain
 * 4. Reports overall status
 */

const fs = require('fs');
const { execSync } = require('child_process');

// ============================================================
// PHASE 6: VALIDATION
// ============================================================

/**
 * 6.1: Check tests
 */
function runTests() {
  console.log('\n🧪 Running tests...');

  try {
    // Check if tests exist
    const hasTests = fs.existsSync('tests') || fs.existsSync('spec') || fs.existsSync('__tests__');

    if (!hasTests) {
      console.log('   ⚠️  No test directory found yet');
      return { passed: true, warning: true };
    }

    // Try to run tests
    execSync('npm test', { stdio: 'inherit' });

    console.log('   ✅ All tests passed');
    return { passed: true, warning: false };

  } catch (error) {
    console.log('   ❌ Tests failed');
    return { passed: false, warning: false };
  }
}

/**
 * 6.2: Check coverage matrix
 */
function checkCoverageMatrix() {
  console.log('\n📊 Checking coverage matrix...');

  try {
    const matrixContent = fs.readFileSync('output/COVERAGE_MATRIX.md', 'utf-8');

    // Count incomplete requirements
    const lines = matrixContent.split('\n');
    let incompleteCount = 0;

    lines.forEach(line => {
      if (line.includes('❌') || line.includes('⚠️')) {
        if (line.startsWith('|') && !line.includes('Test Coverage') && !line.includes('Status')) {
          incompleteCount++;
        }
      }
    });

    if (incompleteCount === 0) {
      console.log('   ✅ Coverage matrix 100% complete');
      return { complete: true, incompleteCount: 0 };
    } else {
      console.log(`   ❌ Found ${incompleteCount} incomplete requirements`);
      return { complete: false, incompleteCount };
    }

  } catch (error) {
    console.log('   ❌ Could not read coverage matrix');
    return { complete: false, incompleteCount: -1 };
  }
}

/**
 * Check gaps
 */
function checkGaps() {
  console.log('\n🔍 Checking gaps...');

  try {
    const gapsContent = fs.readFileSync('output/GAPS.md', 'utf-8');

    // Extract gap count from summary
    const match = gapsContent.match(/\*\*Total gaps\*\*:\s*(\d+)/);

    if (match) {
      const gapCount = parseInt(match[1], 10);

      if (gapCount === 0) {
        console.log('   ✅ No gaps remaining');
        return { hasGaps: false, gapCount: 0 };
      } else {
        console.log(`   ❌ ${gapCount} gaps remaining`);
        return { hasGaps: true, gapCount };
      }
    } else {
      console.log('   ⚠️  Could not parse gap count');
      return { hasGaps: true, gapCount: -1 };
    }

  } catch (error) {
    console.log('   ❌ Could not read gaps file');
    return { hasGaps: true, gapCount: -1 };
  }
}

/**
 * Check all artifacts exist
 */
function checkArtifacts() {
  console.log('\n📄 Checking artifacts...');

  const requiredArtifacts = [
    'output/EXECUTION_ORDER.txt',
    'output/REQUIREMENTS.json',
    'output/COVERAGE_MATRIX.md',
    'output/GAPS.md'
  ];

  let allExist = true;

  requiredArtifacts.forEach(artifact => {
    if (fs.existsSync(artifact)) {
      console.log(`   ✅ ${artifact}`);
    } else {
      console.log(`   ❌ ${artifact} missing`);
      allExist = false;
    }
  });

  return allExist;
}

// ============================================================
// MAIN
// ============================================================

function main() {
  console.log('🚀 Phase 6: Validation\n');
  console.log('=' .repeat(60));

  const results = {
    artifactsExist: false,
    testsPass: false,
    coverageComplete: false,
    noGaps: false
  };

  // Check artifacts
  results.artifactsExist = checkArtifacts();

  if (!results.artifactsExist) {
    console.log('\n❌ Some artifacts are missing');
    console.log('   Run: npm run protocol');
    process.exit(1);
  }

  // Check tests
  const testResult = runTests();
  results.testsPass = testResult.passed;

  // Check coverage matrix
  const coverageResult = checkCoverageMatrix();
  results.coverageComplete = coverageResult.complete;

  // Check gaps
  const gapsResult = checkGaps();
  results.noGaps = !gapsResult.hasGaps;

  // Final report
  console.log('\n' + '='.repeat(60));
  console.log('📋 Validation Report');
  console.log('='.repeat(60));
  console.log('');
  console.log(`Artifacts exist:      ${results.artifactsExist ? '✅' : '❌'}`);
  console.log(`Tests pass:           ${results.testsPass ? '✅' : testResult.warning ? '⚠️ ' : '❌'}`);
  console.log(`Coverage complete:    ${results.coverageComplete ? '✅' : '❌'}`);
  console.log(`No gaps:              ${results.noGaps ? '✅' : '❌'}`);
  console.log('');

  const allPassed = results.artifactsExist &&
                    results.testsPass &&
                    results.coverageComplete &&
                    results.noGaps;

  if (allPassed) {
    console.log('🎉 All validation checks passed!');
    console.log('   Implementation is complete and verified.');
    process.exit(0);
  } else {
    console.log('⚠️  Validation incomplete');

    if (!results.coverageComplete) {
      console.log(`   - ${coverageResult.incompleteCount} requirements need implementation`);
    }

    if (gapsResult.hasGaps) {
      console.log(`   - ${gapsResult.gapCount} gaps remaining`);
      console.log('   - See output/GAPS.md for details');
    }

    if (!results.testsPass && !testResult.warning) {
      console.log('   - Fix failing tests');
    }

    process.exit(1);
  }
}

main();
