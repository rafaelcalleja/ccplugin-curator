# Pending Items - Iteration 3

**Date**: 2025-11-16
**Total Items Found**: 0 (counting in progress...)

---

## 📋 Methodology

Following IMPLEMENT.md protocol:
- ✅ Step 1: Re-read ALL documentation (completed)
- 🔄 Step 2: Identify ALL missing items with atomic granularity
- ⏸️ Step 3: Check convergence (pending)
- ⏸️ Step 4: Implementation (pending)

**Atomic Granularity Rule**: Each item must be verifiable in ONE check.

---

## 🔍 Systematic Verification

### docs/spec/003-tui-visual-spec.md (694 lines)

**TUI Core Structure**

- [ ] 1. Create src/tui/app.tsx with main TUI component export
- [ ] 2. Implement three-panel layout using Ink's Box component
- [ ] 3. Create PLUGINS panel (left) - dimensions: 30% width, full height
- [ ] 4. Create COMPONENTS panel (center) - dimensions: 40% width, full height
- [ ] 5. Create PREVIEW panel (right) - dimensions: 30% width, full height
- [ ] 6. Implement panel focus state management (active panel highlighting)
- [ ] 7. Add box-drawing characters for panel borders (spec lines 24-55)

**PLUGINS Panel (docs/spec/003-tui-visual-spec.md lines 57-95)**

- [ ] 8. Create src/tui/components/PluginsPanel.tsx
- [ ] 9. Render plugin list with name and version
- [ ] 10. Implement cursor navigation (up/down arrows)
- [ ] 11. Add visual cursor indicator (> marker or highlight)
- [ ] 12. Auto-select first plugin on load
- [ ] 13. Emit plugin selection change event to update COMPONENTS panel
- [ ] 14. Display plugin count in header (e.g., "PLUGINS (3)")
- [ ] 15. Handle empty plugin list state

**COMPONENTS Panel (docs/spec/003-tui-visual-spec.md lines 97-168)**

- [ ] 16. Create src/tui/components/ComponentsPanel.tsx
- [ ] 17. Implement hierarchical component tree rendering
- [ ] 18. Render command category with collapsible/expandable state
- [ ] 19. Render agent category with collapsible/expandable state
- [ ] 20. Render skill category with collapsible/expandable state
- [ ] 21. Render hook category with collapsible/expandable state
- [ ] 22. Render MCP category with collapsible/expandable state
- [ ] 23. Implement checkbox rendering for each component ([ ] / [✓])
- [ ] 24. Implement cursor navigation within component tree
- [ ] 25. Implement SPACE key to toggle checkbox selection
- [ ] 26. Implement category expand/collapse with ENTER key
- [ ] 27. Display component path/file for each item
- [ ] 28. Display component count per category (e.g., "Commands (3)")
- [ ] 29. Emit selection change event to update PREVIEW panel
- [ ] 30. Handle empty components state
- [ ] 31. Preserve selection state when switching between plugins

**PREVIEW Panel (docs/spec/003-tui-visual-spec.md lines 170-209)**

- [ ] 32. Create src/tui/components/PreviewPanel.tsx
- [ ] 33. Render live JSON preview of selected components
- [ ] 34. Transform selection to official plugin.json format for preview
- [ ] 35. Apply denormalization transformation to preview
- [ ] 36. Implement JSON syntax highlighting (optional but specified)
- [ ] 37. Display selection summary counts at top (commands, agents, skills, hooks, MCPs)
- [ ] 38. Handle empty selection state ("No components selected")
- [ ] 39. Update preview in real-time when selection changes

**Keyboard Navigation (docs/spec/003-tui-visual-spec.md lines 211-278)**

- [ ] 40. Create src/tui/hooks/useKeyboard.ts
- [ ] 41. Implement ↑ (up arrow) - move cursor up in active panel
- [ ] 42. Implement ↓ (down arrow) - move cursor down in active panel
- [ ] 43. Implement ← (left arrow) - move focus to previous panel
- [ ] 44. Implement → (right arrow) - move focus to next panel
- [ ] 45. Implement SPACE - toggle selection in COMPONENTS panel
- [ ] 46. Implement ENTER - expand/collapse category in COMPONENTS panel
- [ ] 47. Implement S key - trigger save operation
- [ ] 48. Implement Q key - quit application
- [ ] 49. Implement ESC key - quit application
- [ ] 50. Implement TAB key - cycle focus between panels (forward)
- [ ] 51. Implement Shift+TAB - cycle focus between panels (backward)
- [ ] 52. Implement A key - select all components in active plugin
- [ ] 53. Implement N key - deselect all components
- [ ] 54. Display keyboard shortcuts in help footer

**Visual Design (docs/spec/003-tui-visual-spec.md lines 280-312)**

- [ ] 55. Apply color scheme: active panel border (cyan/green)
- [ ] 56. Apply color scheme: inactive panel border (gray)
- [ ] 57. Apply color scheme: selected checkbox (green)
- [ ] 58. Apply color scheme: cursor/highlight (yellow background)
- [ ] 59. Apply color scheme: category headers (bold white)
- [ ] 60. Use box-drawing characters: ┌─┐ (top border)
- [ ] 61. Use box-drawing characters: │ (vertical border)
- [ ] 62. Use box-drawing characters: └─┘ (bottom border)
- [ ] 63. Use box-drawing characters: ├─┤ (section dividers)
- [ ] 64. Render header with app title "Claude Plugin Curator"
- [ ] 65. Render footer with keyboard shortcuts
- [ ] 66. Handle terminal resize gracefully

**State Management (docs/spec/003-tui-visual-spec.md lines 314-371)**

- [ ] 67. Create src/tui/state/useTUIState.ts
- [ ] 68. Implement plugins state (loaded plugins list)
- [ ] 69. Implement selectedPluginIndex state
- [ ] 70. Implement activePanelIndex state (0=PLUGINS, 1=COMPONENTS, 2=PREVIEW)
- [ ] 71. Implement componentsTree state (hierarchical component structure)
- [ ] 72. Implement selection state (Map of selected component IDs)
- [ ] 73. Implement cursorPosition state per panel
- [ ] 74. Implement expandedCategories state (which categories are expanded)
- [ ] 75. Implement actions: selectPlugin(index)
- [ ] 76. Implement actions: setActivePanel(index)
- [ ] 77. Implement actions: toggleComponentSelection(componentId)
- [ ] 78. Implement actions: toggleCategoryExpanded(category)
- [ ] 79. Implement actions: moveCursor(direction)
- [ ] 80. Implement actions: selectAll()
- [ ] 81. Implement actions: deselectAll()
- [ ] 82. Compute live preview JSON from selection state
- [ ] 83. Persist selection when switching between plugins

**Save Operation Integration (docs/spec/003-tui-visual-spec.md lines 373-424)**

- [ ] 84. Create src/tui/hooks/useSave.ts
- [ ] 85. Implement validateSelection() - check if selection is non-empty
- [ ] 86. Implement promptForOutputPath() - ask user for output directory
- [ ] 87. Implement checkOverwrite() - detect existing output directory
- [ ] 88. Implement confirmOverwrite() - prompt user Y/n
- [ ] 89. Call core/save.ts mergeSelections() for multi-plugin selections
- [ ] 90. Call core/save.ts saveSelection() with merged selection
- [ ] 91. Display success message with file paths and component counts
- [ ] 92. Display installation instructions after save
- [ ] 93. Handle save errors with clear error messages
- [ ] 94. Keep TUI open after successful save (as per spec)
- [ ] 95. Display warning "⚠ No hay componentes seleccionados" for empty selection

**TUI Launch from CLI (docs/spec/004-user-workflows.md lines 9-16)**

- [ ] 96. Update src/cli/index.ts line 74-76: replace placeholder with TUI launch
- [ ] 97. Import TUIApp from ../tui/app
- [ ] 98. Call TUIApp with plugins array
- [ ] 99. Handle TUI exit gracefully
- [ ] 100. Pass output directory configuration to TUI

---

### docs/spec/004-user-workflows.md (187 lines)

**Workflow Scenarios (already covered in TUI items above, but verifying completeness)**

- [ ] 101. Verify workflow: scan → normalize → show TUI → select → save (integration test)
- [ ] 102. Verify navigation between plugins updates COMPONENTS panel (integration test)
- [ ] 103. Verify navigation between panels with ← → keys (integration test)
- [ ] 104. Verify SPACE key toggles selection (integration test)
- [ ] 105. Verify multi-plugin selection preservation (integration test)
- [ ] 106. Verify save without selection shows warning (already tested in edge-cases.test.ts)
- [ ] 107. Verify Q key exits TUI immediately (integration test)

---

### docs/spec/008-integration-test-spec.md (453 lines)

**Test Fixture Completeness**

- [ ] 108. Verify test-fixtures/test-plugin has nested/deep-cmd.md (spec line 19)
- [ ] 109. Verify test-fixtures/test-plugin has helpers.ts in skill-alpha (spec line 26)

**Missing Integration Test Scenarios**

Checking spec lines 131-184 (Full workflow scenario):
- [ ] 110. Test: TUI displays with 3 panels (currently no TUI to test)
- [ ] 111. Test: PLUGINS panel shows "test-plugin"
- [ ] 112. Test: COMPONENTS panel shows 15 items total
- [ ] 113. Test: PREVIEW panel is empty initially
- [ ] 114. Test: Navigate to COMPONENTS panel
- [ ] 115. Test: Select analyze.md command
- [ ] 116. Test: Select reviewer.md agent
- [ ] 117. Test: Select skill-alpha skill
- [ ] 118. Test: Select SessionStart: /setup-env.sh hook
- [ ] 119. Test: Select tavily MCP
- [ ] 120. Test: PREVIEW panel shows 5 items selected
- [ ] 121. Test: Press S (Save)
- [ ] 122. Test: See success message with installation instructions
- [ ] 123. Test: TUI remains open after save
- [ ] 124. Test: Verify marketplace.json contains plugin "curated-plugin"
- [ ] 125. Test: Verify marketplace.json source points to "./plugins/curated-plugin"
- [ ] 126. Test: Verify plugin.json has field "commands" with 1 item (already tested)
- [ ] 127. Test: Verify plugin.json has field "agents" with 1 item (already tested)
- [ ] 128. Test: Verify plugin.json has field "skills" with 1 item (already tested)
- [ ] 129. Test: Verify plugin.json has field "hooks" as object with key "SessionStart" (already tested)
- [ ] 130. Test: Verify plugin.json has field "mcpServers" as object with key "tavily" (already tested)
- [ ] 131. Test: Can install with "/plugin marketplace add ./output/curated-plugin"
- [ ] 132. Test: Can install plugin with "/plugin install curated-plugin"

Checking spec lines 185-283 (Multi-plugin scenario):
- [ ] 133. Test: PLUGINS panel shows "test-plugin-a" and "test-plugin-b" (TUI test)
- [ ] 134. Test: Select ALL components from test-plugin-a (TUI test)
- [ ] 135. Test: Select ALL components from test-plugin-b (TUI test)
- [ ] 136. Test: PREVIEW panel shows 4 commands (2 + 2)
- [ ] 137. Test: PREVIEW panel shows 2 agents (1 + 1)
- [ ] 138. Test: PREVIEW panel shows 2 skills (1 + 1)
- [ ] 139. Test: PREVIEW panel shows 2 hooks merged into 1 event
- [ ] 140. Test: PREVIEW panel shows 2 MCPs (1 + 1)
- [ ] 141. Test: Press S (Save) from TUI
- [ ] 142. Test: See success message from TUI
- [ ] 143. Test: TUI remains open after multi-plugin save

Checking spec lines 289-319 (Edge cases):
- [ ] 144. Test: Save with no selection shows warning "⚠ No hay componentes seleccionados" (TUI test)
- [ ] 145. Test: No files are created when saving empty selection (already tested in edge-cases.test.ts)
- [ ] 146. Test: Output directory exists - see prompt "Output directory exists. Overwrite? [Y/n]" (TUI test)
- [ ] 147. Test: Press Y - old directory is deleted (already tested)
- [ ] 148. Test: Press N - save operation is cancelled (TUI test)
- [ ] 149. Test: Plugin with missing files shows error "Command file not found: ./commands/missing.md"
- [ ] 150. Test: Save operation is cancelled when files missing

Checking spec lines 326-386 (Validation scenarios):
- [ ] 151. Test: Different path formats produce same result (various formats)
- [ ] 152. Test: commands as "./commands" shows 3 items
- [ ] 153. Test: commands as ["./commands/*.md"] shows 3 items
- [ ] 154. Test: agents as "./agents/" shows 2 items
- [ ] 155. Test: skills as "./skills/" shows 3 items
- [ ] 156. Test: Empty components - COMPONENTS panel shows only hooks and MCPs
- [ ] 157. Test: Empty components - plugin.json omits empty component fields
- [ ] 158. Test: Hooks transform correctly (already tested in full-workflow.test.ts)
- [ ] 159. Test: MCPs transform correctly (already tested in full-workflow.test.ts)
- [ ] 160. Test: Default values are omitted (version: "0.0.0", empty description, etc.)

---

### docs/spec/001-normalization-protocol.md

**Verification**: Checking if normalize.ts implements all rules...

- [ ] 161. Verify: Auto-discovery finds commands in commands/ directory (already implemented, test exists)
- [ ] 162. Verify: Auto-discovery finds agents in agents/ directory (already implemented, test exists)
- [ ] 163. Verify: Auto-discovery finds skills in skills/*/ directories (already implemented, test exists)
- [ ] 164. Verify: Auto-discovery finds hooks in hooks/hooks.json (already implemented, test exists)
- [ ] 165. Verify: Auto-discovery finds MCPs in .mcp.json (already implemented, test exists)
- [ ] 166. Verify: Path normalization resolves relative paths (already implemented, test exists)
- [ ] 167. Verify: Hooks flatten from nested to flat array (already implemented, test exists)
- [ ] 168. Verify: MCPs transform from object to array (already implemented, test exists)

**Status**: ✅ All normalization rules implemented and tested

---

### docs/spec/002-plugin-format-spec.md

**Verification**: Checking if validation exists...

- [ ] 169. Create src/validation/schemas.ts
- [ ] 170. Load schemas/plugin.schema.json
- [ ] 171. Load schemas/normalized-plugin.schema.json
- [ ] 172. Create validatePluginJson(data) function using Ajv
- [ ] 173. Create validateNormalizedPlugin(data) function using Ajv
- [ ] 174. Add validation calls in normalize.ts before returning
- [ ] 175. Add validation calls in denormalize.ts before returning
- [ ] 176. Add validation calls in save.ts before writing files
- [ ] 177. Add validation error tests for invalid plugin.json
- [ ] 178. Add validation error tests for invalid normalized format

---

### docs/spec/005-transformation-rules.md

**Verification**: Checking if all transformation rules are implemented...

**Status**: ✅ All transformation rules implemented in normalize.ts and tested

---

### docs/spec/006-reverse-transformation-rules.md

**Verification**: Checking if all reverse transformation rules are implemented...

**Status**: ✅ All reverse transformation rules implemented in denormalize.ts and tested

---

### docs/spec/007-save-operation-rules.md

**Verification**: Checking if all save operation rules are implemented...

Checking file operations:
- [ ] 179. Verify: Empty selection validation (implemented in save.ts, needs TUI test)
- [ ] 180. Verify: Output directory overwrite prompt (needs TUI implementation)
- [ ] 181. Verify: File name conflict resolution with namespace prefix (already tested)
- [ ] 182. Verify: MCP name conflict resolution with namespace prefix (already tested)
- [ ] 183. Verify: Hook event merging (already tested)
- [ ] 184. Verify: Skill directory conflict resolution with namespace prefix (already tested)

**Status**: ✅ Most save operation rules implemented and tested, some need TUI integration

---

### docs/decisions/001-json-schema-to-typescript.md

**Verification**: Checking if types are generated from schemas...

- [ ] 185. Verify schemas/plugin.schema.json exists
- [ ] 186. Verify schemas/normalized-plugin.schema.json exists
- [ ] 187. Run: npm run generate-types (check if script exists)
- [ ] 188. Verify src/types/plugin.ts is generated from schema
- [ ] 189. Verify src/types/normalized.ts is generated from schema
- [ ] 190. Add .schema.json suffix check in generate-types script
- [ ] 191. Add automation: regenerate types on schema changes

---

### Additional Missing Items (discovered during verification)

**Build & Development**

- [ ] 192. Verify: npm install successfully installs all dependencies
- [ ] 193. Verify: npm run build successfully compiles TypeScript
- [ ] 194. Verify: npm test runs all tests successfully
- [ ] 195. Add npm run dev script for development mode
- [ ] 196. Add npm run start script to run built CLI
- [ ] 197. Configure TypeScript for React/JSX support
- [ ] 198. Add @types/react and @types/node to devDependencies

**Documentation**

- [ ] 199. Verify README.md has installation instructions
- [ ] 200. Verify README.md has usage examples
- [ ] 201. Verify README.md has keyboard shortcuts reference
- [ ] 202. Add CONTRIBUTING.md if needed

**CI/CD**

- [ ] 203. Add .github/workflows/test.yml for automated testing
- [ ] 204. Add pre-commit hooks for running tests
- [ ] 205. Add pre-commit hooks for running generate-types

---

## 📊 Summary

**Total Pending Items**: 205

**Categories**:
- TUI Implementation: 100 items (1-100)
- TUI Integration Tests: 51 items (101-107, 110-150)
- Validation Implementation: 10 items (169-178)
- Schema/Type Generation: 7 items (185-191)
- Build & Development: 7 items (192-198)
- Documentation: 4 items (199-202)
- CI/CD: 3 items (203-205)
- Save Operation (TUI integration): 2 items (179-180)
- Test Fixtures: 2 items (108-109)
- Path Format Tests: 10 items (151-160)
- Default Value Tests: 1 item (160)
- Core Normalization: 8 items (161-168) - ✅ IMPLEMENTED
- Core Transformation: ✅ IMPLEMENTED
- Core Reverse Transformation: ✅ IMPLEMENTED
- Save Operations (non-TUI): ✅ IMPLEMENTED

**Critical Path**:
1. TUI implementation (items 1-100) - blocks all TUI integration tests
2. Validation implementation (items 169-178) - required by specs
3. Schema type generation verification (items 185-191)
4. TUI integration tests (items 101-150)
5. Build & development setup (items 192-198)

**Convergence Check**:
- Items found: 205
- Previous iteration: 60
- Convergence counter: RESET to 0 (items > 0)
- Must continue to Iteration 4

---

## 🎯 Next Steps (Iteration 3, Step 4)

1. Implement TUI (items 1-100) - this is the largest work item
2. Implement validation (items 169-178)
3. Verify and fix schema type generation (items 185-191)
4. Add TUI integration tests (items 101-150)
5. Verify build setup (items 192-198)
6. Proceed to Iteration 4

---

**IMPLEMENT.md Protocol Status**:
- ✅ Step 1: Re-read ALL documentation
- ✅ Step 2: Identify ALL missing items (205 items found)
- ⏩ Step 3: Check convergence → items > 0 → reset counter to 0
- ⏩ Step 4: Implement items 1-205
