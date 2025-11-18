Feature: Block writes that violate no_cross_references constraint

  Scenario: Block write with markdown link to internal document
    Given a document "docs/spec/001-normalization.md" with frontmatter:
      """
      ---
      gate_constraints:
        - no_cross_references
      document_covers:
        - concepts_and_definitions
      ---
      """
    When I attempt to write content:
      """
      ## Normalization

      See [plugin format](002-plugin-format.md) for details.
      """
    Then the write should be blocked
    And the error message should contain "no_cross_references violation"
    And the error message should contain "002-plugin-format.md"
