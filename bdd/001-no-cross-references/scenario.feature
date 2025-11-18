Feature: Detect cross-references in document content

  Scenario: Content contains markdown link to internal document
    Given a document content
    When the content is "[text](002-file.md)"
    Then cross-reference should be detected
