#!/usr/bin/env node

/**
 * Phase 3: Coverage Matrix Generation
 *
 * This script:
 * 1. Reads REQUIREMENTS.json
 * 2. Searches for test files covering each requirement
 * 3. Searches for implementation files
 * 4. Generates COVERAGE_MATRIX.md
 */

const fs = require('fs');
const { execSync } = require('child_process');

// ============================================================
// PHASE 3: COVERAGE MATRIX GENERATION
// ============================================================

/**
 * 3.1 & 3.2: Search for test file and assess coverage
 */
function findTestCoverage(requirement) {
  const searchTerms = [
    requirement.id,
    requirement.description,
    ...requirement.description.split(/\s+/).filter(word => word.length > 4)
  ];

  let testFile = null;
  let testCoverage = '❌';

  for (const term of searchTerms) {
    try {
      // Escape special characters for grep
      const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      const result = execSync(
        `grep -r "${escapedTerm}" tests/ spec/ __tests__/ 2>/dev/null || true`,
        { encoding: 'utf-8' }
      ).trim();

      if (result) {
        const lines = result.split('\n');
        const firstMatch = lines[0];
        const [file, ...rest] = firstMatch.split(':');

        testFile = file;

        // Assess coverage based on match quality
        if (result.includes(requirement.id)) {
          testCoverage = '✅';
        } else if (lines.length > 1) {
          testCoverage = '⚠️';
        } else {
          testCoverage = '⚠️';
        }

        break;
      }
    } catch (error) {
      // Continue searching
    }
  }

  return { testFile: testFile || '-', testCoverage };
}

/**
 * 3.3: Search for implementation
 */
function findImplementation(requirement) {
  const searchTerms = requirement.description
    .split(/\s+/)
    .filter(word => word.length > 4 && !['MUST', 'SHOULD', 'CRITICAL'].includes(word));

  let implFile = null;

  for (const term of searchTerms.slice(0, 3)) { // Only try first 3 terms
    try {
      const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      const result = execSync(
        `grep -r "${escapedTerm}" src/ lib/ 2>/dev/null || true`,
        { encoding: 'utf-8' }
      ).trim();

      if (result) {
        const firstMatch = result.split('\n')[0];
        const [file] = firstMatch.split(':');
        implFile = file;
        break;
      }
    } catch (error) {
      // Continue searching
    }
  }

  return implFile || '-';
}

/**
 * 3.4: Build coverage matrix
 */
function generateCoverageMatrix(requirements) {
  console.log('\n📊 Phase 3: Generating coverage matrix...');

  const matrix = [];

  requirements.forEach((req, index) => {
    if (index % 10 === 0) {
      process.stdout.write(`\r   Processing requirement ${index + 1}/${requirements.length}...`);
    }

    const { testFile, testCoverage } = findTestCoverage(req);
    const implFile = findImplementation(req);

    // Overall status
    let status;
    if (testCoverage === '✅' && implFile !== '-') {
      status = '✅';
    } else if (testCoverage === '⚠️' || (testCoverage === '❌' && implFile !== '-')) {
      status = '⚠️';
    } else {
      status = '❌';
    }

    matrix.push({
      requirementId: req.id,
      specSource: req.source.replace(/^docs\/spec\//, '').replace(/\.md:/, ':'),
      description: req.description.substring(0, 50) + (req.description.length > 50 ? '...' : ''),
      testFile: testFile === '-' ? '-' : testFile.substring(0, 30),
      testCoverage,
      implFile: implFile === '-' ? '-' : implFile.substring(0, 30),
      status
    });
  });

  console.log(`\r   Processed ${requirements.length} requirements.          `);

  return matrix;
}

/**
 * Format matrix as markdown table
 */
function formatMatrixAsMarkdown(matrix) {
  const lines = [
    '# Coverage Matrix',
    '',
    'This document shows the mapping between requirements, tests, and implementations.',
    '',
    '## Legend',
    '',
    '- ✅ **Full coverage**: Requirement has complete test and implementation',
    '- ⚠️ **Partial coverage**: Test or implementation incomplete',
    '- ❌ **No coverage**: No test or implementation found',
    '',
    '## Matrix',
    '',
    '| Requirement ID | Spec Source | Description | Test File | Test Coverage | Impl File | Status |',
    '|----------------|-------------|-------------|-----------|---------------|-----------|--------|'
  ];

  matrix.forEach(row => {
    lines.push(
      `| ${row.requirementId} | ${row.specSource} | ${row.description} | ${row.testFile} | ${row.testCoverage} | ${row.implFile} | ${row.status} |`
    );
  });

  lines.push('');

  // Summary
  const totalCount = matrix.length;
  const fullCoverage = matrix.filter(r => r.status === '✅').length;
  const partialCoverage = matrix.filter(r => r.status === '⚠️').length;
  const noCoverage = matrix.filter(r => r.status === '❌').length;

  lines.push('## Summary');
  lines.push('');
  lines.push(`- **Total requirements**: ${totalCount}`);
  lines.push(`- ✅ **Full coverage**: ${fullCoverage} (${Math.round(fullCoverage / totalCount * 100)}%)`);
  lines.push(`- ⚠️ **Partial coverage**: ${partialCoverage} (${Math.round(partialCoverage / totalCount * 100)}%)`);
  lines.push(`- ❌ **No coverage**: ${noCoverage} (${Math.round(noCoverage / totalCount * 100)}%)`);
  lines.push('');

  return lines.join('\n');
}

// ============================================================
// MAIN
// ============================================================

function main() {
  console.log('🚀 Phase 3: Coverage Matrix Generation\n');
  console.log('=' .repeat(60));

  // Load requirements
  const requirements = JSON.parse(fs.readFileSync('output/REQUIREMENTS.json', 'utf-8'));
  console.log(`   Loaded ${requirements.length} requirements`);

  // Generate matrix
  const matrix = generateCoverageMatrix(requirements);

  // Save matrix
  const markdown = formatMatrixAsMarkdown(matrix);
  fs.writeFileSync('output/COVERAGE_MATRIX.md', markdown);

  console.log('\n✅ Saved output/COVERAGE_MATRIX.md');

  // Show summary
  const summary = markdown.split('## Summary')[1];
  console.log('\n' + '='.repeat(60));
  console.log('Summary:');
  console.log(summary.trim());
  console.log('\n' + '='.repeat(60));
  console.log('✅ Phase 3 Complete!');
  console.log('   Next: Run npm run find-gaps');
}

main();
