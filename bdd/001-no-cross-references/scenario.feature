Feature: Block writes that violate no_cross_references constraint

  Scenario: Block write with markdown link to internal document
    Given a document with gate_constraint "no_cross_references"
    When I attempt to write content with a markdown link to another document
    Then the write should be blocked
    And the error message should contain "no_cross_references violation"
