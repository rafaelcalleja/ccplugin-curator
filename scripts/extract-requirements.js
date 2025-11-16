#!/usr/bin/env node

/**
 * Phase 1 & 2: Discovery and Requirement Extraction
 *
 * This script:
 * 1. Discovers all spec files
 * 2. Extracts dependency graph
 * 3. Performs topological sort
 * 4. Extracts requirements (BDD scenarios, edge cases, invariants, examples)
 * 5. Generates EXECUTION_ORDER.txt and REQUIREMENTS.json
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ============================================================
// PHASE 1: DISCOVERY
// ============================================================

/**
 * 1.1 Discover all spec files
 */
function discoverSpecFiles() {
  console.log('📂 Phase 1.1: Discovering spec files...');

  const specFiles = execSync('find docs/spec -name "*.md" -not -name "README.md" | sort', { encoding: 'utf-8' })
    .trim()
    .split('\n')
    .filter(Boolean);

  const decisionFiles = execSync('find docs/decisions -name "*.md" -not -name "README.md" | sort', { encoding: 'utf-8' })
    .trim()
    .split('\n')
    .filter(Boolean);

  console.log(`   Found ${specFiles.length} spec files`);
  console.log(`   Found ${decisionFiles.length} decision files`);

  return { specFiles, decisionFiles };
}

/**
 * 1.2 Extract dependency graph
 */
function extractDependencyGraph(specFiles) {
  console.log('\n🔗 Phase 1.2: Extracting dependency graph...');

  const dependencies = {};

  specFiles.forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf-8');
    const fileName = path.basename(filePath);

    dependencies[fileName] = [];

    // Pattern 1: Markdown links [description](./other-spec.md)
    const markdownLinks = content.matchAll(/\[([^\]]+)\]\(\.\/(\d{3}-[^)]+\.md)\)/g);
    for (const match of markdownLinks) {
      const depFile = match[2];
      if (!dependencies[fileName].includes(depFile)) {
        dependencies[fileName].push(depFile);
      }
    }

    // Pattern 2: Direct references "See 005-transformation-rules.md"
    const directRefs = content.matchAll(/(?:See|see|según|according to)\s+(\d{3}-[^\s,.)]+\.md)/g);
    for (const match of directRefs) {
      const depFile = match[1];
      if (!dependencies[fileName].includes(depFile)) {
        dependencies[fileName].push(depFile);
      }
    }

    // Pattern 3: Inline citations (according to 001-normalization-protocol.md)
    const inlineCitations = content.matchAll(/\((?:according to|según)\s+(\d{3}-[^)]+\.md)\)/g);
    for (const match of inlineCitations) {
      const depFile = match[1];
      if (!dependencies[fileName].includes(depFile)) {
        dependencies[fileName].push(depFile);
      }
    }
  });

  console.log('   Dependency graph:');
  Object.entries(dependencies).forEach(([file, deps]) => {
    if (deps.length > 0) {
      console.log(`   ${file} -> [${deps.join(', ')}]`);
    }
  });

  return dependencies;
}

/**
 * Topological sort to get execution order
 */
function topologicalSort(dependencies) {
  console.log('\n📊 Phase 1.3: Performing topological sort...');

  const visited = new Set();
  const result = [];
  const visiting = new Set();

  function visit(node) {
    if (visiting.has(node)) {
      throw new Error(`Circular dependency detected: ${node}`);
    }

    if (visited.has(node)) {
      return;
    }

    visiting.add(node);

    const deps = dependencies[node] || [];
    deps.forEach(dep => {
      if (dependencies[dep] !== undefined) {
        visit(dep);
      }
    });

    visiting.delete(node);
    visited.add(node);
    result.push(node);
  }

  Object.keys(dependencies).forEach(node => visit(node));

  console.log('   Execution order:');
  result.forEach((file, index) => {
    console.log(`   ${index + 1}. ${file}`);
  });

  return result;
}

// ============================================================
// PHASE 2: REQUIREMENT EXTRACTION
// ============================================================

/**
 * 2.1 Extract BDD Scenarios
 */
function extractBDDScenarios(filePath, content) {
  const scenarios = [];
  const fileName = path.basename(filePath);
  const fileId = fileName.match(/^(\d{3})/)?.[1] || 'XXX';

  // Match Gherkin scenario blocks
  const scenarioRegex = /^Scenario:\s*(.+?)\n((?:\s+(?:Given|When|Then|And|But)\s+.+\n?)+)/gm;

  let match;
  while ((match = scenarioRegex.exec(content)) !== null) {
    const description = match[1].trim();
    const scenarioContent = match[0];
    const lineNumber = content.substring(0, match.index).split('\n').length;

    scenarios.push({
      id: `${fileId}::Scenario::${description}`,
      type: 'BDD_Scenario',
      source: `${filePath}:${lineNumber}`,
      description,
      content: scenarioContent.trim()
    });
  }

  return scenarios;
}

/**
 * 2.2 Extract Edge Cases
 */
function extractEdgeCases(filePath, content) {
  const edgeCases = [];
  const fileName = path.basename(filePath);
  const fileId = fileName.match(/^(\d{3})/)?.[1] || 'XXX';

  // Match numbered subsection headers like "### 7.3 File Name Conflicts"
  const edgeCaseRegex = /^###\s+(\d+\.\d+)\s+(.+?)$/gm;

  let match;
  while ((match = edgeCaseRegex.exec(content)) !== null) {
    const sectionNumber = match[1];
    const description = match[2].trim();
    const lineNumber = content.substring(0, match.index).split('\n').length;

    // Extract section content (from this header to next header or end)
    const startIndex = match.index;
    const nextHeaderRegex = /^###?\s+/gm;
    nextHeaderRegex.lastIndex = match.index + match[0].length;
    const nextMatch = nextHeaderRegex.exec(content);
    const endIndex = nextMatch ? nextMatch.index : content.length;
    const sectionContent = content.substring(startIndex, endIndex).trim();

    edgeCases.push({
      id: `${fileId}::EdgeCase::${sectionNumber}`,
      type: 'EdgeCase',
      source: `${filePath}:${lineNumber}`,
      description,
      content: sectionContent
    });
  }

  return edgeCases;
}

/**
 * 2.3 Extract Invariants and Rules
 */
function extractInvariants(filePath, content) {
  const invariants = [];
  const fileName = path.basename(filePath);
  const fileId = fileName.match(/^(\d{3})/)?.[1] || 'XXX';

  const lines = content.split('\n');

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    // Patterns for invariants
    const patterns = [
      /^[-*]\s*(.+?\s+MUST\s+.+)$/i,
      /^[-*]\s*(.+?\s+SHOULD\s+.+)$/i,
      /^[-*]\s*(.+?\s+CRITICAL\s+.+)$/i,
      /^[-*]\s*(❌\s*.+)$/,
      /^[-*]\s*(✅\s*.+)$/
    ];

    patterns.forEach(pattern => {
      const match = trimmedLine.match(pattern);
      if (match) {
        const ruleContent = match[1].trim();
        const lineNumber = index + 1;

        invariants.push({
          id: `${fileId}::Invariant::L${lineNumber}`,
          type: 'Invariant',
          source: `${filePath}:${lineNumber}`,
          description: ruleContent.substring(0, 100) + (ruleContent.length > 100 ? '...' : ''),
          content: ruleContent
        });
      }
    });
  });

  return invariants;
}

/**
 * 2.4 Extract Examples (simplified - looks for code blocks with input/output markers)
 */
function extractExamples(filePath, content) {
  const examples = [];
  const fileName = path.basename(filePath);
  const fileId = fileName.match(/^(\d{3})/)?.[1] || 'XXX';

  // Look for code blocks preceded by "Input" or "Example" and followed by "Output" or "Expected"
  const lines = content.split('\n');

  for (let i = 0; i < lines.length - 5; i++) {
    const line = lines[i].toLowerCase();

    if ((line.includes('input') || line.includes('example')) &&
        lines[i + 1].trim().startsWith('```')) {

      // Find the closing ``` for input
      let inputEnd = i + 2;
      while (inputEnd < lines.length && !lines[inputEnd].trim().startsWith('```')) {
        inputEnd++;
      }

      // Look for output section
      let outputStart = inputEnd + 1;
      while (outputStart < lines.length &&
             !lines[outputStart].toLowerCase().includes('output') &&
             !lines[outputStart].toLowerCase().includes('expected')) {
        outputStart++;
        if (outputStart - inputEnd > 5) break; // Give up if too far
      }

      if (outputStart < lines.length &&
          lines[outputStart + 1]?.trim().startsWith('```')) {

        const lineNumber = i + 1;
        const inputBlock = lines.slice(i + 2, inputEnd).join('\n');

        examples.push({
          id: `${fileId}::Example::L${lineNumber}`,
          type: 'Example',
          source: `${filePath}:${lineNumber}`,
          description: `Example at line ${lineNumber}`,
          content: inputBlock
        });
      }
    }
  }

  return examples;
}

/**
 * 2.5 Consolidate requirements from all spec files
 */
function extractRequirements(executionOrder) {
  console.log('\n📋 Phase 2: Extracting requirements...');

  const allRequirements = [];

  executionOrder.forEach(fileName => {
    const filePath = `docs/spec/${fileName}`;
    console.log(`\n   Processing ${fileName}...`);

    const content = fs.readFileSync(filePath, 'utf-8');

    const scenarios = extractBDDScenarios(filePath, content);
    const edgeCases = extractEdgeCases(filePath, content);
    const invariants = extractInvariants(filePath, content);
    const examples = extractExamples(filePath, content);

    console.log(`      BDD Scenarios: ${scenarios.length}`);
    console.log(`      Edge Cases: ${edgeCases.length}`);
    console.log(`      Invariants: ${invariants.length}`);
    console.log(`      Examples: ${examples.length}`);

    allRequirements.push(...scenarios, ...edgeCases, ...invariants, ...examples);
  });

  console.log(`\n   Total requirements extracted: ${allRequirements.length}`);

  return allRequirements;
}

// ============================================================
// MAIN
// ============================================================

function main() {
  console.log('🚀 Starting Spec-Driven Implementation Protocol\n');
  console.log('=' .repeat(60));

  // Phase 1: Discovery
  const { specFiles } = discoverSpecFiles();
  const dependencies = extractDependencyGraph(specFiles);
  const executionOrder = topologicalSort(dependencies);

  // Save execution order
  fs.writeFileSync('output/EXECUTION_ORDER.txt', executionOrder.join('\n'));
  console.log('\n✅ Saved output/EXECUTION_ORDER.txt');

  // Phase 2: Requirement Extraction
  const requirements = extractRequirements(executionOrder);

  // Save requirements
  fs.writeFileSync('output/REQUIREMENTS.json', JSON.stringify(requirements, null, 2));
  console.log('✅ Saved output/REQUIREMENTS.json');

  console.log('\n' + '='.repeat(60));
  console.log('✅ Phase 1 & 2 Complete!');
  console.log(`   Discovered ${specFiles.length} specs`);
  console.log(`   Extracted ${requirements.length} requirements`);
  console.log('   Next: Run npm run generate-coverage');
}

main();
