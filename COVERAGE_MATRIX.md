# Coverage Matrix

**Generated**: 2025-11-16
**Total Requirements**: 114
**Covered**: 0 (0%)
**Partial**: 0 (0%)
**Missing**: 114 (100%)

---

## Coverage by Type

| Type | Total | Covered | Partial | Missing |
|------|-------|---------|---------|---------|
| BDD_Scenario | 25 | 0 | 0 | 25 |
| EdgeCase | 12 | 0 | 0 | 12 |
| Invariant | 59 | 0 | 0 | 59 |
| Example | 18 | 0 | 0 | 18 |

---

## Coverage by Source File

| Source File | Total | Covered | Missing |
|-------------|-------|---------|---------|
| 001-normalization-protocol.md | 25 | 0 | 25 |
| 004-user-workflows.md | 14 | 0 | 14 |
| 005-transformation-rules.md | 16 | 0 | 16 |
| 006-reverse-transformation-rules.md | 29 | 0 | 29 |
| 007-save-operation-rules.md | 9 | 0 | 9 |
| 008-integration-test-spec.md | 21 | 0 | 21 |

---

## Detailed Requirements Coverage

| Requirement ID | Spec Source | Description | Test File | Test Coverage | Impl File | Status |
|----------------|-------------|-------------|-----------|---------------|-----------|--------|
| 001::Invariant::1 | 001:34 | Path Behavior Rules - CRITICAL | - | ❌ | - | ❌ |
| 001::Invariant::2 | 001:38 | Commands directory loading rule | - | ❌ | - | ❌ |
| 001::Invariant::3 | 001:39 | All paths MUST be relative and start with ./ | - | ❌ | - | ❌ |
| 001::Invariant::4 | 001:40 | Custom commands follow same naming rules | - | ❌ | - | ❌ |
| 001::Invariant::5 | 001:41 | Multiple paths can be specified as arrays | - | ❌ | - | ❌ |
| 001::Invariant::6 | 001:42 | Auto-discovery ALWAYS occurs if default directori... | - | ❌ | - | ❌ |
| 001::Invariant::7 | 001:43 | Custom paths are ADDED to auto-discovered paths | - | ❌ | - | ❌ |
| 001::Invariant::8 | 001:201 | Auto-discovery ALWAYS occurs for default director... | - | ❌ | - | ❌ |
| 001::Invariant::9 | 001:206 | Golden Rule - Custom paths COMPLEMENT auto-discov... | - | ❌ | - | ❌ |
| 001::Invariant::10 | 001:393 | All normalized plugins MUST have all fields defin... | - | ❌ | - | ❌ |
| 001::Invariant::11 | 001:394 | All array fields MUST be arrays | - | ❌ | - | ❌ |
| 001::Invariant::12 | 001:395 | All component paths MUST be relative | - | ❌ | - | ❌ |
| 001::Invariant::13 | 001:396 | All component paths MUST start with ./ | - | ❌ | - | ❌ |
| 001::Invariant::14 | 001:397 | Source field MUST be absolute path | - | ❌ | - | ❌ |
| 001::Invariant::15 | 001:398 | Hooks and MCPs MUST be normalized to flat array | - | ❌ | - | ❌ |
| 001::Invariant::16 | 001:399 | Skills can be defined or auto-discovered | - | ❌ | - | ❌ |
| 001::Invariant::17 | 001:400 | CRITICAL - Custom paths COMPLEMENT auto-discovery | - | ❌ | - | ❌ |
| 001::Invariant::18 | 001:401 | Auto-discovery ALWAYS occurs if default directori... | - | ❌ | - | ❌ |
| 001::Invariant::19 | 001:402 | Hooks can be string or object | - | ❌ | - | ❌ |
| 001::Invariant::20 | 001:403 | MCPs can be string or object | - | ❌ | - | ❌ |
| 001::Example::1 | 001:131 | Complete Example - Official to Normalized transfo... | - | ❌ | - | ❌ |
| 001::Example::2 | 001:230 | Commands Supplementation - Custom paths complemen... | - | ❌ | - | ❌ |
| 001::Example::3 | 001:259 | Inline Hooks Configuration transformation | - | ❌ | - | ❌ |
| 001::Example::4 | 001:306 | Inline MCP Configuration transformation | - | ❌ | - | ❌ |
| 001::Example::5 | 001:350 | Multiple Custom Paths with Auto-Discovery | - | ❌ | - | ❌ |
| 004::BDD_Scenario::1 | 004:25 | Usuario selecciona componentes | - | ❌ | - | ❌ |
| 004::BDD_Scenario::2 | 004:52 | Inicio - Application startup and plugin scanning | - | ❌ | - | ❌ |
| 004::BDD_Scenario::3 | 004:67 | Navegar entre plugins | - | ❌ | - | ❌ |
| 004::BDD_Scenario::4 | 004:74 | Navegar entre paneles | - | ❌ | - | ❌ |
| 004::BDD_Scenario::5 | 004:85 | Seleccionar componentes | - | ❌ | - | ❌ |
| 004::BDD_Scenario::6 | 004:92 | Seleccionar de múltiples plugins | - | ❌ | - | ❌ |
| 004::BDD_Scenario::7 | 004:103 | Guardar selección | - | ❌ | - | ❌ |
| 004::BDD_Scenario::8 | 004:115 | Guardar sin selección | - | ❌ | - | ❌ |
| 004::BDD_Scenario::9 | 004:125 | Conflicto de nombres de comandos | - | ❌ | - | ❌ |
| 004::BDD_Scenario::10 | 004:135 | Conflicto de nombres de agentes | - | ❌ | - | ❌ |
| 004::BDD_Scenario::11 | 004:144 | Conflicto de nombres de MCPs | - | ❌ | - | ❌ |
| 004::BDD_Scenario::12 | 004:153 | Conflicto de directorios de skills | - | ❌ | - | ❌ |
| 004::BDD_Scenario::13 | 004:162 | Merge de hooks del mismo evento | - | ❌ | - | ❌ |
| 004::BDD_Scenario::14 | 004:180 | Salir de la aplicación | - | ❌ | - | ❌ |
| 005::Example::1 | 005:28 | Commands/Agents - String path transformation | - | ❌ | - | ❌ |
| 005::Example::2 | 005:41 | Commands/Agents - Array (no transformation) | - | ❌ | - | ❌ |
| 005::Example::3 | 005:55 | Skills Discovery - Undefined to discovered array | - | ❌ | - | ❌ |
| 005::Example::4 | 005:72 | Hooks - Nested to Flat Array transformation | - | ❌ | - | ❌ |
| 005::Example::5 | 005:153 | MCPs - Object to Array transformation | - | ❌ | - | ❌ |
| 005::Example::6 | 005:233 | Complete Example - Official to Normalized | - | ❌ | - | ❌ |
| 005::Invariant::1 | 005:292 | No undefined values guarantee | - | ❌ | - | ❌ |
| 005::Invariant::2 | 005:293 | Arrays never undefined | - | ❌ | - | ❌ |
| 005::Invariant::3 | 005:294 | Flat structure for hooks/mcps | - | ❌ | - | ❌ |
| 005::Invariant::4 | 005:295 | Event extraction from original keys | - | ❌ | - | ❌ |
| 005::Invariant::5 | 005:296 | Name extraction for MCPs | - | ❌ | - | ❌ |
| 005::Invariant::6 | 005:297 | Field preservation guarantee | - | ❌ | - | ❌ |
| 005::Invariant::7 | 005:298 | Path normalization rule | - | ❌ | - | ❌ |
| 005::EdgeCase::1 | 005:304 | Empty Plugin | - | ❌ | - | ❌ |
| 005::EdgeCase::2 | 005:329 | Multiple Hooks Same Event | - | ❌ | - | ❌ |
| 005::EdgeCase::3 | 005:354 | MCP Name Collisions | - | ❌ | - | ❌ |
| 006::Invariant::1 | 006:14 | Minimalism - Generate clean, minimal plugin.json ... | - | ❌ | - | ❌ |
| 006::Invariant::2 | 006:15 | Validity - Output must be valid Claude Code plugi... | - | ❌ | - | ❌ |
| 006::Invariant::3 | 006:16 | Readability - Prefer human-readable structures | - | ❌ | - | ❌ |
| 006::Invariant::4 | 006:17 | Compatibility - Ensure auto-discovery still works | - | ❌ | - | ❌ |
| 006::Invariant::5 | 006:46 | Omit default values to keep plugin.json minimal | - | ❌ | - | ❌ |
| 006::Invariant::6 | 006:119 | Always output commands/agents as explicit array w... | - | ❌ | - | ❌ |
| 006::Invariant::7 | 006:333 | NEVER include source field in official format | - | ❌ | - | ❌ |
| 006::Invariant::8 | 006:875 | Output is valid official Claude Code plugin format | - | ❌ | - | ❌ |
| 006::Invariant::9 | 006:876 | All non-default metadata is preserved | - | ❌ | - | ❌ |
| 006::Invariant::10 | 006:877 | Component arrays are explicit and unambiguous | - | ❌ | - | ❌ |
| 006::Invariant::11 | 006:878 | Hooks are grouped by event correctly | - | ❌ | - | ❌ |
| 006::Invariant::12 | 006:879 | MCPs are keyed by name correctly | - | ❌ | - | ❌ |
| 006::Invariant::13 | 006:880 | Custom fields in hooks/MCPs are preserved | - | ❌ | - | ❌ |
| 006::Invariant::14 | 006:881 | Output is minimal (defaults omitted) | - | ❌ | - | ❌ |
| 006::Invariant::15 | 006:884 | Non-Guarantee - Original path format not preserved | - | ❌ | - | ❌ |
| 006::Invariant::16 | 006:885 | Non-Guarantee - External file references become i... | - | ❌ | - | ❌ |
| 006::Invariant::17 | 006:886 | Non-Guarantee - Cannot distinguish auto-discovere... | - | ❌ | - | ❌ |
| 006::Invariant::18 | 006:793 | Preserve all fields except event when converting ... | - | ❌ | - | ❌ |
| 006::Invariant::19 | 006:827 | Preserve all fields except name when converting M... | - | ❌ | - | ❌ |
| 006::Example::1 | 006:49 | Metadata Fields - Omit defaults | - | ❌ | - | ❌ |
| 006::Example::2 | 006:72 | Metadata Fields - Include non-default | - | ❌ | - | ❌ |
| 006::Example::3 | 006:129 | Commands & Agents - Explicit arrays with ./ prefix | - | ❌ | - | ❌ |
| 006::Example::4 | 006:195 | Hooks - Array to Nested Object transformation | - | ❌ | - | ❌ |
| 006::Example::5 | 006:281 | MCPs - Array to Nested Object transformation | - | ❌ | - | ❌ |
| 006::Example::6 | 006:353 | Complete Example - Minimal Plugin | - | ❌ | - | ❌ |
| 006::Example::7 | 006:390 | Complete Example - Full-Featured Plugin | - | ❌ | - | ❌ |
| 006::EdgeCase::1 | 006:762 | Empty Plugin | - | ❌ | - | ❌ |
| 006::EdgeCase::2 | 006:791 | Hooks with Extra Fields | - | ❌ | - | ❌ |
| 006::EdgeCase::3 | 006:826 | MCPs with Extra Fields | - | ❌ | - | ❌ |
| 007::EdgeCase::1 | 007:167 | Empty Selection | - | ❌ | - | ❌ |
| 007::EdgeCase::2 | 007:176 | Output Directory Exists | - | ❌ | - | ❌ |
| 007::EdgeCase::3 | 007:185 | File Name Conflicts (Commands & Agents) | - | ❌ | - | ❌ |
| 007::EdgeCase::4 | 007:209 | MCP Name Conflicts | - | ❌ | - | ❌ |
| 007::EdgeCase::5 | 007:230 | Hook Event Merging | - | ❌ | - | ❌ |
| 007::EdgeCase::6 | 007:257 | Skill Directory Conflicts | - | ❌ | - | ❌ |
| 007::Invariant::1 | 007:155 | Validate normalized format before saving | - | ❌ | - | ❌ |
| 007::Invariant::2 | 007:156 | Apply transformation before saving | - | ❌ | - | ❌ |
| 007::Invariant::3 | 007:157 | Validate official format before saving | - | ❌ | - | ❌ |
| 008::BDD_Scenario::1 | 008:131 | Full workflow - Load, select, save, verify | - | ❌ | - | ❌ |
| 008::BDD_Scenario::2 | 008:185 | Multi-plugin selection with conflict resolution | - | ❌ | - | ❌ |
| 008::BDD_Scenario::3 | 008:290 | Save with no selection | - | ❌ | - | ❌ |
| 008::BDD_Scenario::4 | 008:297 | Output directory already exists | - | ❌ | - | ❌ |
| 008::BDD_Scenario::5 | 008:305 | Select from multiple plugins | - | ❌ | - | ❌ |
| 008::BDD_Scenario::6 | 008:313 | Plugin with missing files | - | ❌ | - | ❌ |
| 008::BDD_Scenario::7 | 008:326 | Different path formats produce same result | - | ❌ | - | ❌ |
| 008::BDD_Scenario::8 | 008:338 | Empty components are handled correctly | - | ❌ | - | ❌ |
| 008::BDD_Scenario::9 | 008:345 | Hooks transform correctly | - | ❌ | - | ❌ |
| 008::BDD_Scenario::10 | 008:361 | MCPs transform correctly | - | ❌ | - | ❌ |
| 008::BDD_Scenario::11 | 008:378 | Default values are omitted | - | ❌ | - | ❌ |
| 008::Invariant::1 | 008:428 | Can load test-plugin without errors | - | ❌ | - | ❌ |
| 008::Invariant::2 | 008:429 | All 15 components visible in TUI | - | ❌ | - | ❌ |
| 008::Invariant::3 | 008:430 | Selection works correctly | - | ❌ | - | ❌ |
| 008::Invariant::4 | 008:431 | Save generates both output files | - | ❌ | - | ❌ |
| 008::Invariant::5 | 008:432 | Official plugin.json is valid | - | ❌ | - | ❌ |
| 008::Invariant::6 | 008:433 | All selected files copied to output | - | ❌ | - | ❌ |
| 008::Invariant::7 | 008:434 | Output plugin can be loaded by Claude Code | - | ❌ | - | ❌ |
| 008::Invariant::8 | 008:437 | No crashes or unhandled errors | - | ❌ | - | ❌ |
| 008::Invariant::9 | 008:438 | Clear error messages for invalid states | - | ❌ | - | ❌ |
| 008::Invariant::10 | 008:439 | All edge cases handled gracefully | - | ❌ | - | ❌ |

---

## Summary

This coverage matrix shows the current test and implementation status for all 114 requirements extracted from the specification documents. Since this is a new project with no test or implementation files yet, all requirements are currently uncovered.

### Next Steps

1. Begin implementation of core functionality
2. Create corresponding test files for each requirement type
3. Update this matrix as tests and implementations are added
4. Track progress toward 100% coverage

### Legend

- ✅ = Fully covered (has tests and implementation)
- ⚠️ = Partially covered (has tests OR implementation, but not both)
- ❌ = Not covered (no tests and no implementation)
- `-` = File not found/not created yet
