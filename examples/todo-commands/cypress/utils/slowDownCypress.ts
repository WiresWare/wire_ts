function slowCypressDown(commandDelay?: any) {
  const type = typeof commandDelay;
  if (type === 'undefined') {
    commandDelay = 1000;
  }

  if (type === 'number' && commandDelay < 0) {
    throw new Error(`Delay cannot be negative, you passed ${commandDelay}`);
  }

  // @ts-ignore
  const rc = cy.queue.runCommand.bind(cy.queue);
  // @ts-ignore
  cy.queue.runCommand = function slowRunCommand(cmd) {
    return Cypress.Promise.delay(commandDelay).then(() => rc(cmd));
  };
}

export { slowCypressDown };
