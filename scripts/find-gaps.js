#!/usr/bin/env node

/**
 * Phase 4: Gap Analysis
 *
 * This script:
 * 1. Reads COVERAGE_MATRIX.md
 * 2. Filters incomplete requirements (❌ or ⚠️)
 * 3. Sorts by dependency order (from EXECUTION_ORDER.txt)
 * 4. Generates GAPS.md
 */

const fs = require('fs');

// ============================================================
// PHASE 4: GAP ANALYSIS
// ============================================================

/**
 * 4.1: Filter incomplete requirements
 */
function filterIncompleteRequirements(matrixContent) {
  console.log('\n🔍 Phase 4.1: Filtering incomplete requirements...');

  const lines = matrixContent.split('\n');
  const tableStart = lines.findIndex(line => line.startsWith('| Requirement ID'));
  const tableHeader = tableStart + 1; // Skip separator line

  const gaps = [];

  for (let i = tableHeader + 1; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line.startsWith('|')) {
      break; // End of table
    }

    if (line.includes('❌') || line.includes('⚠️')) {
      const parts = line.split('|').map(p => p.trim()).filter(Boolean);

      if (parts.length >= 7) {
        gaps.push({
          requirementId: parts[0],
          specSource: parts[1],
          description: parts[2],
          testFile: parts[3],
          testCoverage: parts[4],
          implFile: parts[5],
          status: parts[6]
        });
      }
    }
  }

  console.log(`   Found ${gaps.length} incomplete requirements`);

  return gaps;
}

/**
 * 4.2: Sort by dependency order
 */
function sortByDependencyOrder(gaps, executionOrder) {
  console.log('\n📊 Phase 4.2: Sorting by dependency order...');

  // Extract spec number from requirement ID (e.g., "001" from "001::Invariant::L123")
  const getSpecNumber = (requirementId) => {
    const match = requirementId.match(/^(\d{3})/);
    return match ? match[1] : '999';
  };

  // Create a map of spec number to order index
  const orderMap = {};
  executionOrder.forEach((fileName, index) => {
    const specNumber = fileName.match(/^(\d{3})/)?.[1];
    if (specNumber) {
      orderMap[specNumber] = index;
    }
  });

  // Sort gaps by execution order
  gaps.sort((a, b) => {
    const specA = getSpecNumber(a.requirementId);
    const specB = getSpecNumber(b.requirementId);

    const orderA = orderMap[specA] !== undefined ? orderMap[specA] : 999;
    const orderB = orderMap[specB] !== undefined ? orderMap[specB] : 999;

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    // If same spec, sort by requirement ID
    return a.requirementId.localeCompare(b.requirementId);
  });

  console.log('   Gaps sorted by dependency order');

  return gaps;
}

/**
 * Format gaps as markdown
 */
function formatGapsAsMarkdown(gaps, executionOrder) {
  const lines = [
    '# Implementation Gaps',
    '',
    'This document lists all requirements that need implementation, sorted by dependency order.',
    '',
    '## Priority Order',
    '',
    'Implementation should follow this order based on spec dependencies:',
    ''
  ];

  // Show execution order
  executionOrder.forEach((fileName, index) => {
    const specNumber = fileName.match(/^(\d{3})/)?.[1];
    const gapCount = gaps.filter(g => g.requirementId.startsWith(specNumber + '::')).length;

    if (gapCount > 0) {
      lines.push(`${index + 1}. **${fileName}** - ${gapCount} gaps`);
    }
  });

  lines.push('');
  lines.push('---');
  lines.push('');

  // Group gaps by spec
  const gapsBySpec = {};
  gaps.forEach(gap => {
    const specNumber = gap.requirementId.match(/^(\d{3})/)?.[1] || 'XXX';
    if (!gapsBySpec[specNumber]) {
      gapsBySpec[specNumber] = [];
    }
    gapsBySpec[specNumber].push(gap);
  });

  // Output gaps by spec in dependency order
  executionOrder.forEach(fileName => {
    const specNumber = fileName.match(/^(\d{3})/)?.[1];
    const specGaps = gapsBySpec[specNumber];

    if (specGaps && specGaps.length > 0) {
      lines.push(`## ${fileName}`);
      lines.push('');
      lines.push('| Requirement ID | Description | Test Coverage | Impl File | Status |');
      lines.push('|----------------|-------------|---------------|-----------|--------|');

      specGaps.forEach(gap => {
        lines.push(
          `| ${gap.requirementId} | ${gap.description} | ${gap.testCoverage} | ${gap.implFile} | ${gap.status} |`
        );
      });

      lines.push('');
    }
  });

  // Summary
  lines.push('---');
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`**Total gaps**: ${gaps.length}`);
  lines.push('');

  const byStatus = {
    '❌': gaps.filter(g => g.status === '❌').length,
    '⚠️': gaps.filter(g => g.status === '⚠️').length
  };

  lines.push(`- ❌ No coverage: ${byStatus['❌']}`);
  lines.push(`- ⚠️ Partial coverage: ${byStatus['⚠️']}`);
  lines.push('');

  lines.push('## Next Steps');
  lines.push('');
  lines.push('For each gap above:');
  lines.push('');
  lines.push('1. Write failing test for the requirement');
  lines.push('2. Implement feature to pass the test');
  lines.push('3. Run test suite to verify');
  lines.push('4. Update coverage matrix');
  lines.push('');

  return lines.join('\n');
}

// ============================================================
// MAIN
// ============================================================

function main() {
  console.log('🚀 Phase 4: Gap Analysis\n');
  console.log('=' .repeat(60));

  // Load coverage matrix
  const matrixContent = fs.readFileSync('output/COVERAGE_MATRIX.md', 'utf-8');

  // Load execution order
  const executionOrder = fs.readFileSync('output/EXECUTION_ORDER.txt', 'utf-8')
    .trim()
    .split('\n');

  console.log(`   Loaded execution order (${executionOrder.length} specs)`);

  // Filter incomplete requirements
  let gaps = filterIncompleteRequirements(matrixContent);

  // Sort by dependency order
  gaps = sortByDependencyOrder(gaps, executionOrder);

  // Save gaps
  const markdown = formatGapsAsMarkdown(gaps, executionOrder);
  fs.writeFileSync('output/GAPS.md', markdown);

  console.log('\n✅ Saved output/GAPS.md');

  console.log('\n' + '='.repeat(60));
  console.log('✅ Phase 4 Complete!');
  console.log(`   Found ${gaps.length} gaps to implement`);
  console.log('   Next: Implement gaps following dependency order');
  console.log('   Run: npm run validate (to check progress)');
}

main();
