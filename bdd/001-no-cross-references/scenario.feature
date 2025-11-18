Feature: Detect cross-references in document content

  Scenario: Content contains markdown link to internal document
    Given a document content
    When the content is "[text](002-file.md)"
    Then cross-reference should be detected

  Scenario: Content contains plain reference to internal document
    Given a document content
    When the content is "See 002-file.md for details"
    Then cross-reference should be detected

  Scenario: Content contains relative path reference
    Given a document content
    When the content is "Check ../other/file.md"
    Then cross-reference should be detected

  Scenario: Content contains only regular text
    Given a document content
    When the content is "Normalization transforms formats"
    Then cross-reference should NOT be detected

  Scenario: Content contains external link
    Given a document content
    When the content is "[docs](https://example.com)"
    Then cross-reference should NOT be detected

  Scenario: Content contains anchor link
    Given a document content
    When the content is "[section](#heading)"
    Then cross-reference should NOT be detected
