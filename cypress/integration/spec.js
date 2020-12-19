/// <reference types="Cypress" />

describe('My App', () => {
  it('has an input element', () => {
    cy.visit('/')

    const input = cy.get('#input-new-text')
    input.should('be.visible')
    
    input.type('test')

    cy.get('#form-new-item').submit()

    cy.get('#items').contains('test').should('be.visible')
  })
})